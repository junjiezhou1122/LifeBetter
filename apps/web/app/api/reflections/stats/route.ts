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

    if (storage.version === 2) {
      if (!storage.reflections) {
        storage.reflections = [];
      }
      return storage;
    }

    return { items: [], metaSkills: [], notifications: [], reflections: [], version: 2 };
  } catch (error) {
    return { items: [], metaSkills: [], notifications: [], reflections: [], version: 2 };
  }
}

function calculateStreak(reflections: any[]): { currentStreak: number; longestStreak: number; totalReflections: number } {
  if (reflections.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalReflections: 0 };
  }

  // Sort reflections by date (newest first)
  const sortedReflections = [...reflections].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique dates
  const uniqueDates = [...new Set(sortedReflections.map(r => r.date))].sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Check if there's a reflection today or yesterday
  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    currentStreak = 1;
    let checkDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];

      if (uniqueDates[i] === prevDateStr) {
        currentStreak++;
        checkDate = new Date(uniqueDates[i]);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const nextDate = new Date(uniqueDates[i + 1]);
    const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalReflections: reflections.length
  };
}

export async function GET() {
  try {
    const storage = readStorage();
    const reflections = storage.reflections || [];

    const stats = calculateStreak(reflections);

    // Check if reflected today
    const today = new Date().toISOString().split('T')[0];
    const reflectedToday = reflections.some((r: any) => r.date === today);

    return NextResponse.json({
      ...stats,
      reflectedToday
    });
  } catch (error) {
    console.error('Failed to fetch reflection stats:', error);
    return NextResponse.json({ error: 'Failed to fetch reflection stats' }, { status: 500 });
  }
}
