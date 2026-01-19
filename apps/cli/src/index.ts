#!/usr/bin/env node

import { problemCommand } from './commands/problem.js';
import { listCommand } from './commands/list.js';
import { todayCommand } from './commands/today.js';
import { ensureStorageExists } from './storage.js';

const args = process.argv.slice(2);
const command = args[0];

// Ensure storage exists on every run
ensureStorageExists();

switch (command) {
  case 'p':
  case 'problem':
    problemCommand(args.slice(1).join(' '));
    break;

  case 'list':
    listCommand();
    break;

  case 'today':
    todayCommand();
    break;

  case '--version':
  case '-v':
    console.log('lifebetter v1.0.0');
    break;

  case '--help':
  case '-h':
  case undefined:
    console.log('LifeBetter - Problem Tracker CLI\n');
    console.log('Usage:');
    console.log('  lb p <problem>    Log a problem');
    console.log('  lb list           List all problems');
    console.log('  lb today          Show today\'s problems');
    console.log('  lb --version      Show version');
    console.log('  lb --help         Show this help');
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "lb --help" for usage');
    process.exit(1);
}
