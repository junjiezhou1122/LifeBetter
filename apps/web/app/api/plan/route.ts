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

interface Task {
  id: string;
  problemId: string;
  parentTaskId?: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  blockedBy?: string[];
  blocking?: string[];
}

interface Problem {
  id: string;
  text: string;
  status: string;
  priority: string;
  createdAt: string;
  blockedBy?: string[];
  blocking?: string[];
}

function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function calculatePriority(item: Task | Problem): number {
  let score = 0;

  // Blocking others = highest priority
  if (item.blocking && item.blocking.length > 0) {
    score += 100;
  }

  // Being blocked = lower priority
  if (item.blockedBy && item.blockedBy.length > 0) {
    score -= 50;
  }

  // Age factor (older = higher priority)
  const ageInDays = daysSince(item.createdAt);
  if (ageInDays > 7) score += 30;
  if (ageInDays > 14) score += 50;
  if (ageInDays > 30) score += 70;

  // Status factor
  if (item.status === 'in_progress') score += 40;
  if (item.status === 'todo') score += 20;
  if (item.status === 'blocked') score -= 30;

  // Manual priority
  const priorityScores: Record<string, number> = {
    urgent: 80,
    high: 60,
    medium: 40,
    low: 20
  };
  score += priorityScores[item.priority] || 40;

  return score;
}

export async function GET() {
  try {
    const storage = readStorage();
    const allItems = [
      ...storage.problems.map((p: Problem) => ({ ...p, type: 'problem' })),
      ...storage.tasks.map((t: Task) => ({ ...t, type: 'task' }))
    ];

    // Calculate priority scores for all items
    const itemsWithScores = allItems.map(item => ({
      ...item,
      priorityScore: calculatePriority(item)
    }));

    // Sort by priority score
    itemsWithScores.sort((a, b) => b.priorityScore - a.priorityScore);

    // Generate today's plan (top 5 actionable items)
    const todaysPlan = itemsWithScores
      .filter(item =>
        item.status !== 'done' &&
        item.status !== 'blocked' &&
        (!item.blockedBy || item.blockedBy.length === 0)
      )
      .slice(0, 5);

    // Find high priority items
    const highPriority = itemsWithScores
      .filter(item =>
        item.status !== 'done' &&
        (item.priority === 'urgent' || item.priority === 'high')
      )
      .slice(0, 10);

    // Find blocked items
    const blocked = itemsWithScores
      .filter(item =>
        item.status === 'blocked' ||
        (item.blockedBy && item.blockedBy.length > 0)
      );

    // Find items blocking others
    const blockingOthers = itemsWithScores
      .filter(item =>
        item.status !== 'done' &&
        item.blocking &&
        item.blocking.length > 0
      );

    // Generate suggestions
    const suggestions: string[] = [];

    if (blockingOthers.length > 0) {
      suggestions.push(`🚨 ${blockingOthers.length} item(s) are blocking other tasks. Focus on these first!`);
    }

    if (blocked.length > 0) {
      suggestions.push(`⚠️ ${blocked.length} item(s) are blocked. Review dependencies.`);
    }

    const oldItems = itemsWithScores.filter(item =>
      item.status !== 'done' && daysSince(item.createdAt) > 14
    );
    if (oldItems.length > 0) {
      suggestions.push(`📅 ${oldItems.length} item(s) have been pending for over 2 weeks.`);
    }

    const inProgress = itemsWithScores.filter(item => item.status === 'in_progress');
    if (inProgress.length > 3) {
      suggestions.push(`⚡ You have ${inProgress.length} items in progress. Consider focusing on fewer tasks.`);
    }

    if (suggestions.length === 0) {
      suggestions.push('✨ Great! No urgent issues. Keep up the good work!');
    }

    return NextResponse.json({
      todaysPlan,
      highPriority,
      blocked,
      blockingOthers,
      suggestions,
      stats: {
        total: allItems.length,
        done: allItems.filter(i => i.status === 'done').length,
        inProgress: inProgress.length,
        blocked: blocked.length
      }
    });
  } catch (error) {
    console.error('Plan generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan' },
      { status: 500 }
    );
  }
}
