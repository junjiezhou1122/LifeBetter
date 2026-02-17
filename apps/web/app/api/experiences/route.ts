import { NextResponse } from 'next/server';
import { readStorage, writeStorage } from '@/lib/server/storage';
import type { Experience } from '@/lib/types';

function generateId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  const storage = await readStorage();
  return NextResponse.json(storage.experiences);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { taskId, task, approach, outcome, timeSpent, feedback, retrospective, context } = body;

  if (!taskId || !task || !outcome) {
    return NextResponse.json({ error: 'taskId, task, and outcome are required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const experience: Experience = {
    id: generateId(),
    taskId,
    task,
    approach: approach || '',
    outcome,
    timeSpent,
    feedback,
    retrospective: retrospective || {
      whatWorked: '',
      whatFailed: '',
      keyTurningPoint: '',
      ifRedoWouldChange: '',
      applicableScenarios: [],
    },
    context: context || {
      taskType: '',
      complexity: '',
      domain: '',
      principlesUsed: [],
    },
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
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const storage = await readStorage();
  const index = storage.experiences.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
  }

  storage.experiences[index] = {
    ...storage.experiences[index],
    ...updates,
    id: storage.experiences[index].id,
    updatedAt: new Date().toISOString(),
  };
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
