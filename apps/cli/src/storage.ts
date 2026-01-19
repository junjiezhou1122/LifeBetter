import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';
import type { Problem, Storage, Task, Notification } from './types.js';

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
      const emptyStorage: Storage = {
        problems: [],
        tasks: [],
        notifications: []
      };
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

    // Validate structure and migrate old format
    if (!storage.problems || !Array.isArray(storage.problems)) {
      throw new Error('Invalid storage format');
    }

    // Ensure new fields exist (migration)
    if (!storage.tasks) storage.tasks = [];
    if (!storage.notifications) storage.notifications = [];

    // Migrate old problems to new format
    storage.problems = storage.problems.map(p => ({
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
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return empty storage
      return {
        problems: [],
        tasks: [],
        notifications: []
      };
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
    updatedAt: new Date().toISOString(),
    status: 'backlog',
    priority: 'medium',
    breakdownStatus: 'pending',
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

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

/**
 * Create a new task
 */
export function createTask(
  problemId: string,
  title: string,
  description?: string,
  parentTaskId?: string
): Task {
  const storage = readStorage();

  const task: Task = {
    id: randomUUID(),
    problemId,
    parentTaskId,
    title,
    description,
    status: 'todo',
    priority: 'medium',
    order: storage.tasks.filter(t => t.problemId === problemId).length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    canBreakdown: true,
  };

  storage.tasks.push(task);
  writeStorage(storage);

  return task;
}

/**
 * Get all tasks for a problem
 */
export function getTasksForProblem(problemId: string): Task[] {
  const storage = readStorage();
  return storage.tasks
    .filter(t => t.problemId === problemId && !t.parentTaskId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get subtasks for a task
 */
export function getSubtasks(taskId: string): Task[] {
  const storage = readStorage();
  return storage.tasks
    .filter(t => t.parentTaskId === taskId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get task by ID
 */
export function getTaskById(id: string): Task | null {
  const storage = readStorage();
  return storage.tasks.find(t => t.id === id) || null;
}

/**
 * Update task
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const storage = readStorage();
  const index = storage.tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return null;
  }

  storage.tasks[index] = {
    ...storage.tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeStorage(storage);

  return storage.tasks[index];
}

/**
 * Delete task
 */
export function deleteTask(id: string): Task | null {
  const storage = readStorage();
  const index = storage.tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return null;
  }

  const deleted = storage.tasks[index];

  // Also delete all subtasks
  storage.tasks = storage.tasks.filter(t => t.id !== id && t.parentTaskId !== id);

  writeStorage(storage);
  return deleted;
}

/**
 * Get all tasks
 */
export function getAllTasks(): Task[] {
  const storage = readStorage();
  return storage.tasks;
}

// ============================================================================
// NOTIFICATION MANAGEMENT
// ============================================================================

/**
 * Create notification
 */
export function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const storage = readStorage();

  const newNotification: Notification = {
    ...notification,
    id: randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
  };

  storage.notifications.push(newNotification);
  writeStorage(storage);

  return newNotification;
}

/**
 * Get all notifications
 */
export function getAllNotifications(unreadOnly: boolean = false): Notification[] {
  const storage = readStorage();
  const notifications = storage.notifications.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (unreadOnly) {
    return notifications.filter(n => !n.read);
  }

  return notifications;
}

/**
 * Mark notification as read
 */
export function markNotificationRead(id: string): Notification | null {
  const storage = readStorage();
  const index = storage.notifications.findIndex(n => n.id === id);

  if (index === -1) {
    return null;
  }

  storage.notifications[index].read = true;
  writeStorage(storage);

  return storage.notifications[index];
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsRead(): void {
  const storage = readStorage();
  storage.notifications.forEach(n => n.read = true);
  writeStorage(storage);
}

/**
 * Delete notification
 */
export function deleteNotification(id: string): Notification | null {
  const storage = readStorage();
  const index = storage.notifications.findIndex(n => n.id === id);

  if (index === -1) {
    return null;
  }

  const deleted = storage.notifications[index];
  storage.notifications.splice(index, 1);
  writeStorage(storage);

  return deleted;
}

// ============================================================================
// BLOCKING RELATIONSHIPS
// ============================================================================

/**
 * Add blocking relationship
 */
export function addBlocker(blockedId: string, blockerId: string): void {
  const storage = readStorage();

  // Find if it's a problem or task
  const problem = storage.problems.find(p => p.id === blockedId);
  const task = storage.tasks.find(t => t.id === blockedId);

  if (problem) {
    if (!problem.blockedBy) problem.blockedBy = [];
    if (!problem.blockedBy.includes(blockerId)) {
      problem.blockedBy.push(blockerId);
    }
  } else if (task) {
    if (!task.blockedBy) task.blockedBy = [];
    if (!task.blockedBy.includes(blockerId)) {
      task.blockedBy.push(blockerId);
    }
  }

  // Update blocker's blocking list
  const blockerProblem = storage.problems.find(p => p.id === blockerId);
  const blockerTask = storage.tasks.find(t => t.id === blockerId);

  if (blockerProblem) {
    if (!blockerProblem.blocking) blockerProblem.blocking = [];
    if (!blockerProblem.blocking.includes(blockedId)) {
      blockerProblem.blocking.push(blockedId);
    }
  } else if (blockerTask) {
    if (!blockerTask.blocking) blockerTask.blocking = [];
    if (!blockerTask.blocking.includes(blockedId)) {
      blockerTask.blocking.push(blockedId);
    }
  }

  writeStorage(storage);
}

/**
 * Remove blocking relationship
 */
export function removeBlocker(blockedId: string, blockerId: string): void {
  const storage = readStorage();

  // Remove from blocked item
  const problem = storage.problems.find(p => p.id === blockedId);
  const task = storage.tasks.find(t => t.id === blockedId);

  if (problem && problem.blockedBy) {
    problem.blockedBy = problem.blockedBy.filter(id => id !== blockerId);
  } else if (task && task.blockedBy) {
    task.blockedBy = task.blockedBy.filter(id => id !== blockerId);
  }

  // Remove from blocker item
  const blockerProblem = storage.problems.find(p => p.id === blockerId);
  const blockerTask = storage.tasks.find(t => t.id === blockerId);

  if (blockerProblem && blockerProblem.blocking) {
    blockerProblem.blocking = blockerProblem.blocking.filter(id => id !== blockedId);
  } else if (blockerTask && blockerTask.blocking) {
    blockerTask.blocking = blockerTask.blocking.filter(id => id !== blockedId);
  }

  writeStorage(storage);
}

/**
 * Get all blocked items
 */
export function getBlockedItems(): Array<Problem | Task> {
  const storage = readStorage();
  const blocked: Array<Problem | Task> = [];

  storage.problems.forEach(p => {
    if (p.blockedBy && p.blockedBy.length > 0) {
      blocked.push(p);
    }
  });

  storage.tasks.forEach(t => {
    if (t.blockedBy && t.blockedBy.length > 0) {
      blocked.push(t);
    }
  });

  return blocked;
}

