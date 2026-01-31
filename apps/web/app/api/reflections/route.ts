import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';

function getStoragePath(): string {
  const homeDir = os.homedir();
  const storageDir = path.join(homeDir, '.lifebetter');

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

    if (storage.version === 2) {
      if (!storage.reflections) {
        storage.reflections = [];
      }
      return storage;
    }

    return { items: [], metaSkills: [], notifications: [], reflections: [], version: 2 };
  } catch (error) {
    return { items: [], metaSkills: [], notifications: [], reflections: [], version: 2 };
  }
}

function writeStorage(storage: any) {
  const storagePath = getStoragePath();
  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2), 'utf-8');
}

interface Reflection {
  id: string;
  date: string; // YYYY-MM-DD format
  content: string; // Markdown content
  createdAt: string;
  updatedAt: string;
}

// GET - Fetch reflections with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '30');

    const storage = readStorage();
    let reflections = storage.reflections || [];

    // Filter by date range
    if (dateFrom) {
      reflections = reflections.filter((r: Reflection) => r.date >= dateFrom);
    }
    if (dateTo) {
      reflections = reflections.filter((r: Reflection) => r.date <= dateTo);
    }

    // Sort by date (newest first)
    reflections.sort((a: Reflection, b: Reflection) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Limit results
    reflections = reflections.slice(0, limit);

    return NextResponse.json(reflections);
  } catch (error) {
    console.error('Failed to fetch reflections:', error);
    return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 });
  }
}

// POST - Create a new reflection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, content } = body;

    if (!date || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: date, content' },
        { status: 400 }
      );
    }

    const storage = readStorage();

    // Check if reflection already exists for this date
    const existingIndex = storage.reflections.findIndex((r: Reflection) => r.date === date);

    if (existingIndex !== -1) {
      return NextResponse.json(
        { error: 'Reflection already exists for this date. Use PATCH to update.' },
        { status: 409 }
      );
    }

    const newReflection: Reflection = {
      id: randomUUID(),
      date,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.reflections.push(newReflection);
    writeStorage(storage);

    return NextResponse.json(newReflection, { status: 201 });
  } catch (error) {
    console.error('Failed to create reflection:', error);
    return NextResponse.json({ error: 'Failed to create reflection' }, { status: 500 });
  }
}

// PATCH - Update an existing reflection
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing reflection id' }, { status: 400 });
    }

    const storage = readStorage();
    const reflectionIndex = storage.reflections.findIndex((r: Reflection) => r.id === id);

    if (reflectionIndex === -1) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    storage.reflections[reflectionIndex] = {
      ...storage.reflections[reflectionIndex],
      ...body,
      id, // Keep original ID
      updatedAt: new Date().toISOString()
    };

    writeStorage(storage);

    return NextResponse.json(storage.reflections[reflectionIndex]);
  } catch (error) {
    console.error('Failed to update reflection:', error);
    return NextResponse.json({ error: 'Failed to update reflection' }, { status: 500 });
  }
}

// DELETE - Delete a reflection
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing reflection id' }, { status: 400 });
    }

    const storage = readStorage();
    const reflectionIndex = storage.reflections.findIndex((r: Reflection) => r.id === id);

    if (reflectionIndex === -1) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    storage.reflections.splice(reflectionIndex, 1);
    writeStorage(storage);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete reflection:', error);
    return NextResponse.json({ error: 'Failed to delete reflection' }, { status: 500 });
  }
}
