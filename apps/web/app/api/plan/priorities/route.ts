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

interface PriorityItem {
  id: string;
  title: string;
  priority: string;
  status: string;
  score: number;
  reason: string;
  age: number;
  blockedBy?: string[];
  blocking?: string[];
}

function calculatePriorityScore(item: Item): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // Base priority score
  const priorityScores: { [key: string]: number } = {
    high: 100,
    medium: 50,
    low: 25
  };
  score += priorityScores[item.priority] || 50;

  // Age-based urgency (older items get higher priority)
  const ageInDays = Math.floor(
    (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (ageInDays > 30) {
    score += 50;
    reasons.push('Over 30 days old');
  } else if (ageInDays > 14) {
    score += 30;
    reasons.push('Over 2 weeks old');
  } else if (ageInDays > 7) {
    score += 15;
    reasons.push('Over 1 week old');
  }

  // Status-based scoring
  if (item.status === 'in_progress') {
    score += 40;
    reasons.push('Currently in progress');
  } else if (item.status === 'blocked') {
    score += 60;
    reasons.push('Blocked - needs attention');
  } else if (item.status === 'todo') {
    score += 20;
    reasons.push('Ready to start');
  }

  // Blocking other items increases priority
  if (item.blocking && item.blocking.length > 0) {
    score += item.blocking.length * 25;
    reasons.push(`Blocking ${item.blocking.length} other item(s)`);
  }

  // Being blocked decreases priority slightly
  if (item.blockedBy && item.blockedBy.length > 0) {
    score -= item.blockedBy.length * 10;
    reasons.push(`Blocked by ${item.blockedBy.length} item(s)`);
  }

  // Root level items (depth 0) get slight boost
  if (item.depth === 0) {
    score += 10;
  }

  const reason = reasons.length > 0 ? reasons.join(', ') : 'Standard priority';

  return { score, reason };
}

export async function GET() {
  try {
    const storage = readStorage();
    const items: Item[] = storage.items || [];

    // Filter out completed items
    const activeItems = items.filter(item => item.status !== 'done');

    // Calculate priority scores
    const priorityItems: PriorityItem[] = activeItems.map(item => {
      const { score, reason } = calculatePriorityScore(item);
      const ageInDays = Math.floor(
        (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: item.id,
        title: item.title,
        priority: item.priority,
        status: item.status,
        score,
        reason,
        age: ageInDays,
        blockedBy: item.blockedBy,
        blocking: item.blocking
      };
    });

    // Sort by score (highest first) and take top 10
    const topPriorities = priorityItems
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json(topPriorities);
  } catch (error) {
    console.error('Failed to calculate priorities:', error);
    return NextResponse.json({ error: 'Failed to calculate priorities' }, { status: 500 });
  }
}
