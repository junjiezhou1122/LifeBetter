#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface OldStorage {
  problems: any[];
  tasks: any[];
  notifications: any[];
}

interface NewStorage {
  items: any[];
  notifications: any[];
  version: number;
}

function getStoragePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.lifebetter', 'problems.json');
}

function getBackupPath(): string {
  const homeDir = os.homedir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(homeDir, '.lifebetter', `problems.backup.${timestamp}.json`);
}

function calculateDepth(itemId: string, parentMap: Map<string, string>): number {
  let depth = 0;
  let currentId = itemId;

  while (parentMap.has(currentId)) {
    depth++;
    currentId = parentMap.get(currentId)!;
  }

  return depth;
}

function migrateStorage(): void {
  const storagePath = getStoragePath();

  // Check if storage exists
  if (!fs.existsSync(storagePath)) {
    console.log('⚠️  No storage file found. Nothing to migrate.');
    return;
  }

  // Read old storage
  let oldStorage: OldStorage;
  try {
    const data = fs.readFileSync(storagePath, 'utf-8');
    oldStorage = JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read storage:', error);
    return;
  }

  // Check if already migrated
  if ((oldStorage as any).version === 2 && (oldStorage as any).items) {
    console.log('✅ Storage already migrated to version 2. Nothing to do.');
    return;
  }

  // Create backup
  const backupPath = getBackupPath();
  fs.writeFileSync(backupPath, JSON.stringify(oldStorage, null, 2));
  console.log(`✅ Backup created: ${backupPath}`);

  // Migrate to new structure
  const newItems: any[] = [];
  const parentMap = new Map<string, string>();

  // 1. Migrate Problems to root-level Items
  console.log(`\n📦 Migrating ${oldStorage.problems?.length || 0} problems...`);
  (oldStorage.problems || []).forEach((problem, index) => {
    const item = {
      id: problem.id,
      title: problem.text,                    // text -> title
      description: '',                         // Empty for problems
      parentId: null,                          // Root level
      depth: 0,                                // Root depth
      order: index,                            // Preserve order
      status: problem.status || 'backlog',
      priority: problem.priority || 'medium',
      breakdownStatus: problem.breakdownStatus || 'pending',
      canBreakdown: true,
      createdAt: problem.createdAt,
      updatedAt: problem.updatedAt,
      blockedBy: problem.blockedBy || [],
      blocking: problem.blocking || [],
      tags: problem.tags || [],
      estimatedHours: problem.estimatedHours,
      actualHours: problem.actualHours,
      dueDate: problem.dueDate,
      resources: problem.resources,
      aiAnalysis: problem.aiAnalysis
    };
    newItems.push(item);
  });

  // 2. Build parent map for tasks
  (oldStorage.tasks || []).forEach(task => {
    if (task.parentTaskId) {
      parentMap.set(task.id, task.parentTaskId);
    } else if (task.problemId) {
      parentMap.set(task.id, task.problemId);
    }
  });

  // 3. Migrate Tasks to nested Items
  console.log(`📦 Migrating ${oldStorage.tasks?.length || 0} tasks...`);
  (oldStorage.tasks || []).forEach(task => {
    const parentId = task.parentTaskId || task.problemId || null;
    const depth = calculateDepth(task.id, parentMap);

    const item = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      parentId: parentId,
      depth: depth,
      order: task.order || 0,
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      breakdownStatus: 'pending',              // Default for tasks
      canBreakdown: task.canBreakdown !== false,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      blockedBy: task.blockedBy || [],
      blocking: task.blocking || [],
      tags: [],                                 // Tasks didn't have tags
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      resources: task.resources
    };
    newItems.push(item);
  });

  // 4. Create new storage
  const newStorage: NewStorage = {
    items: newItems,
    notifications: oldStorage.notifications || [],
    version: 2
  };

  // 5. Write new storage
  const tempPath = storagePath + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(newStorage, null, 2));
  fs.renameSync(tempPath, storagePath);

  console.log(`\n✅ Migration complete!`);
  console.log(`   - Migrated ${oldStorage.problems?.length || 0} problems to root items`);
  console.log(`   - Migrated ${oldStorage.tasks?.length || 0} tasks to nested items`);
  console.log(`   - Total items: ${newItems.length}`);
  console.log(`   - Backup saved to: ${backupPath}`);
  console.log(`\n🎉 Your data has been successfully migrated to the new unified Item model!`);
}

// Run migration
try {
  migrateStorage();
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
