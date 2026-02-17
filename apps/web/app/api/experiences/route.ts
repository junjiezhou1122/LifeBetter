import { NextResponse } from 'next/server';
import { readStorage, writeStorage } from '@/lib/server/storage';
import type { Experience } from '@/lib/types';

function generateId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  const storage = await readStorage();
  const experiences = taskId
    ? storage.experiences.filter((e) => e.taskId === taskId)
    : storage.experiences;

  return NextResponse.json(experiences);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { taskId, content } = body;

  if (!taskId || !content) {
    return NextResponse.json({ error: 'taskId and content are required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const experience: Experience = {
    id: generateId(),
    taskId,
    content,
    createdAt: now,
    updatedAt: now,
  };

  const storage = await readStorage();
  storage.experiences.push(experience);
  await writeStorage(storage);

  return NextResponse.json(experience, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, content } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const storage = await readStorage();
  const index = storage.experiences.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
  }

  if (content !== undefined) {
    storage.experiences[index].content = content;
  }
  storage.experiences[index].updatedAt = new Date().toISOString();
  await writeStorage(storage);

  return NextResponse.json(storage.experiences[index]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const storage = await readStorage();
  storage.experiences = storage.experiences.filter((e) => e.id !== id);
  await writeStorage(storage);

  return NextResponse.json({ success: true });
}
