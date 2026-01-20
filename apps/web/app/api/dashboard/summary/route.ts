import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

    if (storage.version === 2 && storage.items) {
      if (!storage.metaSkills) {
        storage.metaSkills = [];
      }
      return storage;
    }

    return { items: [], metaSkills: [], notifications: [], version: 2 };
  } catch (error) {
    return { items: [], metaSkills: [], notifications: [], version: 2 };
  }
}

export async function GET() {
  try {
    const storage = readStorage();
    const items = storage.items || [];

    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Calculate stats
    const totalItems = items.length;
    const activeItems = items.filter((item: any) =>
      item.status !== 'done'
    ).length;

    const completedToday = items.filter((item: any) =>
      item.status === 'done' &&
      new Date(item.updatedAt).getTime() >= todayStart.getTime()
    ).length;

    const inProgress = items.filter((item: any) =>
      item.status === 'in_progress'
    ).length;

    const blocked = items.filter((item: any) =>
      item.status === 'blocked'
    ).length;

    const highPriority = items.filter((item: any) =>
      item.priority === 'high' && item.status !== 'done'
    ).length;

    const completedItems = items.filter((item: any) => item.status === 'done').length;
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Get recent items (last 10 updated)
    const recentItems = items
      .sort((a: any, b: any) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 10)
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        updatedAt: item.updatedAt
      }));

    const stats = {
      totalItems,
      activeItems,
      completedToday,
      inProgress,
      blocked,
      highPriority,
      completionRate,
      avgCompletionTime: 0 // TODO: Calculate based on created/completed dates
    };

    return NextResponse.json({
      stats,
      recentItems
    });
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 });
  }
}
