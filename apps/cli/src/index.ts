#!/usr/bin/env node

import { problemCommand } from './commands/problem.js';
import { listCommand } from './commands/list.js';
import { todayCommand } from './commands/today.js';
import { deleteCommand } from './commands/delete.js';
import { configCommand } from './commands/config.js';
import { reviewCommand } from './commands/review.js';
import { summaryCommand } from './commands/summary.js';
import { searchCommand } from './commands/search.js';
import { ensureStorageExists } from './storage.js';

const args = process.argv.slice(2);
const command = args[0];

// Ensure storage exists on every run
ensureStorageExists();

// Async wrapper for commands that need it
async function main() {
  switch (command) {
    case 'p':
    case 'problem':
      const noAI = args.includes('--no-ai');
      const problemText = args.slice(1).filter(arg => arg !== '--no-ai').join(' ');
      await problemCommand(problemText, noAI);
      break;

    case 'list':
      listCommand();
      break;

    case 'today':
      todayCommand();
      break;

    case 'delete':
      await deleteCommand(args.slice(1).join(' '));
      break;

    case 'config':
      await configCommand(args.slice(1));
      break;

    case 'review':
      await reviewCommand(args.slice(1));
      break;

    case 'summary':
      await summaryCommand(args.slice(1));
      break;

    case 's':
    case 'search':
      searchCommand(args.slice(1));
      break;

    case '--version':
    case '-v':
      console.log('lifebetter v1.5.0');
      break;

    case '--help':
    case '-h':
    case undefined:
      console.log('LifeBetter - Problem Tracker CLI\n');
      console.log('Usage:');
      console.log('  lb p <problem>              Log a problem');
      console.log('  lb p <problem> --no-ai      Log without AI analysis');
      console.log('  lb list                     List all problems');
      console.log('  lb today                    Show today\'s problems');
      console.log('  lb delete <search>          Delete a problem by text search');
      console.log('  lb config setup             Configure AI settings');
      console.log('  lb config show              Show current configuration');
      console.log('  lb config set <key> <val>   Set a configuration value');
      console.log('  lb review                   Review today\'s problems with AI');
      console.log('  lb review --all             Review all problems');
      console.log('  lb review --last N          Review last N problems');
      console.log('  lb review --topic <text>    Review problems by topic');
      console.log('  lb summary [daily]          Daily summary');
      console.log('  lb summary weekly           Weekly summary');
      console.log('  lb summary monthly          Monthly summary');
      console.log('  lb search <query>           Search problems by text');
      console.log('  lb s <query>                Search problems (short alias)');
      console.log('  lb --version                Show version');
      console.log('  lb --help                   Show this help');
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "lb --help" for usage');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
