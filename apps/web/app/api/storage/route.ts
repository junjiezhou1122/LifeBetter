import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Read storage from CLI's location
function getStoragePath(): string {
  const homeDir = os.homedir();
  const storageDir = path.join(homeDir, '.lifebetter');
  return path.join(storageDir, 'problems.json');
}

function readStorage() {
  try {
    const storagePath = getStoragePath();
    const data = fs.readFileSync(storagePath, 'utf-8');
    const storage = JSON.parse(data);

    // Ensure new fields exist (migration)
    if (!storage.tasks) storage.tasks = [];
    if (!storage.notifications) storage.notifications = [];

    // Migrate old problems
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
  } catch (error) {
    return { problems: [], tasks: [], notifications: [] };
  }
}

export async function GET() {
  const storage = readStorage();
  return NextResponse.json(storage);
}
