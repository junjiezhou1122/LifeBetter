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
    storage.problems = storage.problems.map((p: any) => ({
      ...p,
      status: p.status || 'backlog',
      priority: p.priority || 'medium',
      breakdownStatus: p.breakdownStatus || 'pending',
      updatedAt: p.updatedAt || p.createdAt,
      blockedBy: p.blockedBy || [],
      blocking: p.blocking || []
    }));
    return storage;
  } catch {
    return { problems: [], tasks: [], notifications: [] };
  }
}

function writeStorage(storage: any) {
  const storagePath = getStoragePath();
  fs.writeFileSync(storagePath, JSON.stringify(storage, null, 2), 'utf-8');
}

export async function GET() {
  const storage = readStorage();
  return NextResponse.json(storage.problems);
}

export async function POST(request: Request) {
  const { text, priority = 'medium' } = await request.json();
  const storage = readStorage();

  const newProblem = {
    id: crypto.randomUUID(),
    text,
    status: 'backlog',
    priority,
    breakdownStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blockedBy: [],
    blocking: [],
    tags: []
  };

  storage.problems.push(newProblem);
  writeStorage(storage);
  return NextResponse.json(newProblem);
}

export async function PATCH(request: Request) {
  const { id, updates } = await request.json();
  const storage = readStorage();

  const index = storage.problems.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  storage.problems[index] = {
    ...storage.problems[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeStorage(storage);
  return NextResponse.json(storage.problems[index]);
}
