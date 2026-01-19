import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function getStoragePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.lifebetter', 'problems.json');
}

function readStorage() {
  try {
    const data = fs.readFileSync(getStoragePath(), 'utf-8');
    const storage = JSON.parse(data);
    if (!storage.tasks) storage.tasks = [];
    if (!storage.notifications) storage.notifications = [];
    return storage;
  } catch {
    return { problems: [], tasks: [], notifications: [] };
  }
}

function writeStorage(storage: any) {
  fs.writeFileSync(getStoragePath(), JSON.stringify(storage, null, 2), 'utf-8');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const problemId = searchParams.get('problemId');
  const parentTaskId = searchParams.get('parentTaskId');

  const storage = readStorage();

  // Filter by parentTaskId (for subtasks)
  if (parentTaskId) {
    const tasks = storage.tasks.filter((t: any) => t.parentTaskId === parentTaskId);
    return NextResponse.json(tasks);
  }

  // Filter by problemId (top-level tasks only)
  if (problemId) {
    const tasks = storage.tasks.filter((t: any) => t.problemId === problemId && !t.parentTaskId);
    return NextResponse.json(tasks);
  }

  return NextResponse.json(storage.tasks);
}

export async function POST(request: Request) {
  const { problemId, parentTaskId, title, description, priority = 'medium' } = await request.json();
  const storage = readStorage();

  const newTask = {
    id: crypto.randomUUID(),
    problemId,
    parentTaskId: parentTaskId || null,
    title,
    description: description || '',
    status: 'todo',
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blockedBy: [],
    blocking: [],
    canBreakdown: true
  };

  storage.tasks.push(newTask);
  writeStorage(storage);
  return NextResponse.json(newTask);
}

export async function PATCH(request: Request) {
  const { id, updates } = await request.json();
  const storage = readStorage();

  const index = storage.tasks.findIndex((t: any) => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  storage.tasks[index] = {
    ...storage.tasks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeStorage(storage);
  return NextResponse.json(storage.tasks[index]);
}
