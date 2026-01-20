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

interface Item {
  id: string;
  title: string;
  description?: string;
  parentId: string | null;
  depth: number;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  blockedBy?: string[];
  blocking?: string[];
  tags?: string[];
}

interface Notification {
  id: string;
  type: 'overdue' | 'blocked' | 'suggestion' | 'daily_plan';
  title: string;
  message: string;
  itemId?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

function generateNotifications(items: Item[]): Notification[] {
  const notifications: Notification[] = [];
  const now = Date.now();

  // Filter active items
  const activeItems = items.filter(item => item.status !== 'done');

  // Check for overdue items (in progress for more than 7 days)
  activeItems.forEach(item => {
    if (item.status === 'in_progress') {
      const daysSinceUpdate = Math.floor(
        (now - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceUpdate > 7) {
        notifications.push({
          id: `overdue-${item.id}`,
          type: 'overdue',
          title: 'Item needs attention',
          message: `"${item.title}" has been in progress for ${daysSinceUpdate} days without updates.`,
          itemId: item.id,
          priority: 'high',
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  // Check for blocked items
  activeItems.forEach(item => {
    if (item.status === 'blocked' || (item.blockedBy && item.blockedBy.length > 0)) {
      notifications.push({
        id: `blocked-${item.id}`,
        type: 'blocked',
        title: 'Blocked item detected',
        message: `"${item.title}" is blocked by ${item.blockedBy?.length || 0} item(s). Consider unblocking or breaking down.`,
        itemId: item.id,
        priority: 'medium',
        createdAt: new Date().toISOString()
      });
    }
  });

  // Check for old backlog items (more than 30 days)
  activeItems.forEach(item => {
    if (item.status === 'backlog') {
      const daysSinceCreation = Math.floor(
        (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreation > 30) {
        notifications.push({
          id: `stale-${item.id}`,
          type: 'suggestion',
          title: 'Stale backlog item',
          message: `"${item.title}" has been in backlog for ${daysSinceCreation} days. Consider moving to todo or archiving.`,
          itemId: item.id,
          priority: 'low',
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  // Suggest items to work on (high priority todo items)
  const highPriorityTodos = activeItems.filter(
    item => item.status === 'todo' && item.priority === 'high'
  );

  if (highPriorityTodos.length > 0) {
    const item = highPriorityTodos[0];
    notifications.push({
      id: `suggestion-${item.id}`,
      type: 'suggestion',
      title: 'Ready to start',
      message: `"${item.title}" is a high priority item ready to be started.`,
      itemId: item.id,
      priority: 'medium',
      createdAt: new Date().toISOString()
    });
  }

  // Daily plan suggestion (if it's morning and there are items)
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 10 && activeItems.length > 0) {
    const inProgressCount = activeItems.filter(i => i.status === 'in_progress').length;
    const todoCount = activeItems.filter(i => i.status === 'todo').length;

    notifications.push({
      id: 'daily-plan',
      type: 'daily_plan',
      title: 'Good morning! 🌅',
      message: `You have ${inProgressCount} items in progress and ${todoCount} items ready to start. Check your daily plan.`,
      priority: 'medium',
      createdAt: new Date().toISOString()
    });
  }

  // Sort by priority (high first)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to top 10 notifications
  return notifications.slice(0, 10);
}

export async function GET() {
  try {
    const storage = readStorage();
    const items: Item[] = storage.items || [];

    const notifications = generateNotifications(items);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to generate notifications:', error);
    return NextResponse.json({ error: 'Failed to generate notifications' }, { status: 500 });
  }
}
