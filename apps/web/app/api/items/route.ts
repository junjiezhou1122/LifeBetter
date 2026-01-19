import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function getStoragePath(): string {
  const homeDir = os.homedir();
  const storageDir = path.join(homeDir, '.lifebetter');

  // Ensure directory exists
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  return path.join(storageDir, 'problems.json');
}

function readStorage() {
  const storagePath = getStoragePath();

  try {
    const data = fs.readFileSync(storagePath, 'utf-8');
    const storage = JSON.parse(data);

    // Check if already migrated to version 2
    if (storage.version === 2 && storage.items) {
      // Ensure metaSkills array exists
      if (!storage.metaSkills) {
        storage.metaSkills = [];
      }
      return storage;
    }

    // If old format, return empty (migration should be run first)
    if (storage.problems || storage.tasks) {
      console.warn('⚠️  Old storage format detected. Please run: npm run migrate');
      return { items: [], metaSkills: [], notifications: [], version: 2 };
    }

    return storage;
  } catch (error) {
    // If file doesn't exist, create empty storage
    const emptyStorage = { items: [], metaSkills: [], notifications: [], version: 2 };
    writeStorage(emptyStorage);
    return emptyStorage;
  }
}

function writeStorage(storage: any) {
  const storagePath = getStoragePath();
  const tempPath = storagePath + '.tmp';

  fs.writeFileSync(tempPath, JSON.stringify(storage, null, 2), 'utf-8');
  fs.renameSync(tempPath, storagePath);
}

// GET /api/items?parentId=null&depth=0
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  const depth = searchParams.get('depth');

  const storage = readStorage();
  let items = storage.items || [];

  // Filter by parentId
  if (parentId !== null) {
    if (parentId === 'null' || parentId === '') {
      // Root items only (parentId is null)
      items = items.filter((item: any) => item.parentId === null);
    } else {
      // Children of specific parent
      items = items.filter((item: any) => item.parentId === parentId);
    }
  }

  // Filter by depth
  if (depth !== null) {
    const depthNum = parseInt(depth, 10);
    items = items.filter((item: any) => item.depth === depthNum);
  }

  return NextResponse.json(items);
}

// POST /api/items
export async function POST(request: Request) {
  const { parentId, title, description, priority = 'medium', status } = await request.json();

  if (!title || title.trim() === '') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const storage = readStorage();

  // Calculate depth
  let depth = 0;
  if (parentId) {
    const parent = storage.items.find((i: any) => i.id === parentId);
    if (parent) {
      depth = parent.depth + 1;
    }
  }

  // Determine default status based on depth
  const defaultStatus = depth === 0 ? 'backlog' : 'todo';

  const newItem = {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description?.trim() || '',
    parentId: parentId || null,
    depth,
    order: 0,
    status: status || defaultStatus,
    priority,
    breakdownStatus: 'pending',
    canBreakdown: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blockedBy: [],
    blocking: [],
    tags: [],
    metaSkillIds: [],
  };

  storage.items.push(newItem);
  writeStorage(storage);

  return NextResponse.json(newItem);
}

// PATCH /api/items
export async function PATCH(request: Request) {
  const { id, updates } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  const storage = readStorage();
  const index = storage.items.findIndex((i: any) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  storage.items[index] = {
    ...storage.items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeStorage(storage);
  return NextResponse.json(storage.items[index]);
}

// DELETE /api/items?id=xxx
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
  }

  const storage = readStorage();
  const index = storage.items.findIndex((i: any) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Remove the item
  storage.items.splice(index, 1);

  // Recursively remove all children
  function removeChildren(parentId: string) {
    const children = storage.items.filter((i: any) => i.parentId === parentId);
    children.forEach((child: any) => {
      removeChildren(child.id);
      const idx = storage.items.findIndex((i: any) => i.id === child.id);
      if (idx !== -1) storage.items.splice(idx, 1);
    });
  }
  removeChildren(id);

  writeStorage(storage);
  return NextResponse.json({ success: true });
}
