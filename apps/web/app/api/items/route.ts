import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { readStorage, writeStorage } from '@/lib/server/storage';
import type { Item, ItemStatus } from '@/lib/types';

// GET /api/items?parentId=null&depth=0
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  const depth = searchParams.get('depth');

  const storage = await readStorage();
  let items = storage.items;

  // Filter by parentId
  if (parentId !== null) {
    if (parentId === 'null' || parentId === '') {
      // Root items only (parentId is null)
      items = items.filter((item) => item.parentId === null);
    } else {
      // Children of specific parent
      items = items.filter((item) => item.parentId === parentId);
    }
  }

  // Filter by depth
  if (depth !== null) {
    const depthNum = parseInt(depth, 10);
    items = items.filter((item) => item.depth === depthNum);
  }

  return NextResponse.json(items);
}

// POST /api/items
export async function POST(request: Request) {
  const { parentId, title, description, priority = 'medium', status } = await request.json();

  if (!title || title.trim() === '') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const storage = await readStorage();

  // Calculate depth
  let depth = 0;
  if (parentId) {
    const parent = storage.items.find((i) => i.id === parentId);
    if (parent) {
      depth = parent.depth + 1;
    }
  }

  // Determine default status based on depth
  const defaultStatus: ItemStatus = depth === 0 ? 'backlog' : 'todo';

  const newItem: Item = {
    id: randomUUID(),
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
  await writeStorage(storage);

  return NextResponse.json(newItem);
}

// PATCH /api/items
export async function PATCH(request: Request) {
  const { id, updates } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  const storage = await readStorage();
  const index = storage.items.findIndex((i) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  storage.items[index] = {
    ...storage.items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await writeStorage(storage);
  return NextResponse.json(storage.items[index]);
}

// DELETE /api/items?id=xxx
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
  }

  const storage = await readStorage();
  const index = storage.items.findIndex((i) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Remove the item
  storage.items.splice(index, 1);

  // Recursively remove all children
  function removeChildren(parentId: string) {
    const children = storage.items.filter((i) => i.parentId === parentId);
    children.forEach((child) => {
      removeChildren(child.id);
      const idx = storage.items.findIndex((i) => i.id === child.id);
      if (idx !== -1) storage.items.splice(idx, 1);
    });
  }
  removeChildren(id);

  await writeStorage(storage);
  return NextResponse.json({ success: true });
}
