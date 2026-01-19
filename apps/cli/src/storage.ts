import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';
import type { Problem, Storage } from './types.js';

/**
 * Get the path to the storage file
 */
export function getStoragePath(): string {
  const homeDir = os.homedir();
  const storageDir = path.join(homeDir, '.lifebetter');
  return path.join(storageDir, 'problems.json');
}

/**
 * Get the directory path for storage
 */
function getStorageDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.lifebetter');
}

/**
 * Ensure storage directory and file exist
 */
export function ensureStorageExists(): void {
  const storageDir = getStorageDir();
  const storagePath = getStoragePath();

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Create empty storage file if it doesn't exist
    if (!fs.existsSync(storagePath)) {
      const emptyStorage: Storage = { problems: [] };
      fs.writeFileSync(storagePath, JSON.stringify(emptyStorage, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error(`Error: Cannot create storage at ${storageDir}`);
    console.error('Please check directory permissions');
    process.exit(1);
  }
}

/**
 * Read storage from disk
 */
export function readStorage(): Storage {
  const storagePath = getStoragePath();

  try {
    const data = fs.readFileSync(storagePath, 'utf-8');
    const storage = JSON.parse(data) as Storage;

    // Validate structure
    if (!storage.problems || !Array.isArray(storage.problems)) {
      throw new Error('Invalid storage format');
    }

    return storage;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return empty storage
      return { problems: [] };
    }

    // JSON parse error or other error
    console.error(`Error: Storage file is corrupted at ${storagePath}`);
    console.error('Please backup and delete the file to start fresh');
    process.exit(1);
  }
}

/**
 * Write storage to disk atomically
 */
export function writeStorage(storage: Storage): void {
  const storagePath = getStoragePath();
  const tempPath = storagePath + '.tmp';

  try {
    // Write to temp file first
    const data = JSON.stringify(storage, null, 2);
    fs.writeFileSync(tempPath, data, 'utf-8');

    // Atomic rename
    fs.renameSync(tempPath, storagePath);
  } catch (error) {
    console.error(`Error: Cannot write to ${storagePath}`);
    console.error('Please check directory permissions');
    process.exit(1);
  }
}

/**
 * Add a new problem
 */
export function addProblem(text: string): Problem {
  const storage = readStorage();

  const problem: Problem = {
    id: randomUUID(),
    text: text,
    createdAt: new Date().toISOString(),
  };

  storage.problems.push(problem);
  writeStorage(storage);

  return problem;
}

/**
 * Get all problems in reverse chronological order
 */
export function getAllProblems(): Problem[] {
  const storage = readStorage();

  // Sort by createdAt descending (newest first)
  return storage.problems.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Get today's problems
 */
export function getTodayProblems(): Problem[] {
  const allProblems = getAllProblems();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return allProblems.filter(problem => {
    const problemDate = new Date(problem.createdAt);
    return problemDate.getTime() >= todayTimestamp;
  });
}

/**
 * Format a timestamp as a human-readable "time ago" string
 */
export function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) {
    const timeStr = then.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `Yesterday at ${timeStr}`;
  }

  return then.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Search problems by partial text match (case-insensitive)
 */
export function searchProblems(searchText: string): Problem[] {
  const storage = readStorage();
  const lowerSearch = searchText.toLowerCase();

  return storage.problems.filter(problem =>
    problem.text.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Delete a problem by ID
 */
export function deleteProblem(id: string): Problem | null {
  const storage = readStorage();
  const index = storage.problems.findIndex(p => p.id === id);

  if (index === -1) {
    return null;
  }

  const deleted = storage.problems[index];
  storage.problems.splice(index, 1);
  writeStorage(storage);

  return deleted;
}

/**
 * Update a problem (for adding AI analysis)
 */
export function updateProblem(id: string, updates: Partial<Problem>): Problem | null {
  const storage = readStorage();
  const index = storage.problems.findIndex(p => p.id === id);

  if (index === -1) {
    return null;
  }

  storage.problems[index] = { ...storage.problems[index], ...updates };
  writeStorage(storage);

  return storage.problems[index];
}

/**
 * Get problems within a date range
 */
export function getProblemsInRange(from: Date, to: Date): Problem[] {
  const allProblems = getAllProblems();
  const fromTime = from.getTime();
  const toTime = to.getTime();

  return allProblems.filter(problem => {
    const problemTime = new Date(problem.createdAt).getTime();
    return problemTime >= fromTime && problemTime <= toTime;
  });
}

/**
 * Get a problem by ID
 */
export function getProblemById(id: string): Problem | null {
  const storage = readStorage();
  return storage.problems.find(p => p.id === id) || null;
}
