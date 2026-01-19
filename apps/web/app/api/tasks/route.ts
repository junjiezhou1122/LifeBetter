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

  const storage = readStorage();

  if (problemId) {
    const tasks = storage.tasks.filter((t: any) => t.problemId === problemId && !t.parentTaskId);
    return NextResponse.json(tasks);
  }

  return NextResponse.json(storage.tasks);
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
