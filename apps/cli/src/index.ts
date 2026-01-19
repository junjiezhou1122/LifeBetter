#!/usr/bin/env node

import { problemCommand } from './commands/problem.js';
import { problemManagementCommand } from './commands/problemManagement.js';
import { taskCommand } from './commands/task.js';
import { boardCommand, statsCommand } from './commands/board.js';
import { alertsCommand, notificationsCommand, statusCommand } from './commands/alerts.js';
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
      // Check if it's a subcommand or quick create
      const subcommands = ['list', 'show', 'status', 'priority', 'breakdown', 'approve', 'reject'];
      if (args[1] && subcommands.includes(args[1])) {
        await problemManagementCommand(args.slice(1));
      } else {
        const noAI = args.includes('--no-ai');
        const problemText = args.slice(1).filter(arg => arg !== '--no-ai').join(' ');
        await problemCommand(problemText, noAI);
      }
      break;

    case 't':
    case 'task':
      await taskCommand(args.slice(1));
      break;

    case 'board':
      boardCommand(args.slice(1));
      break;

    case 'stats':
      statsCommand();
      break;

    case 'status':
      await statusCommand();
      break;

    case 'alerts':
      await alertsCommand(args.slice(1));
      break;

    case 'notify':
    case 'notifications':
      await notificationsCommand(args.slice(1));
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
      console.log('lifebetter v2.0.0');
      break;

    case '--help':
    case '-h':
    case undefined:
      console.log('LifeBetter - Problem Solving System\n');
      console.log('Quick Actions:');
      console.log('  lb p "problem"              Log a problem');
      console.log('  lb t "task" --problem <id>  Create a task');
      console.log('  lb board                    Show Kanban board');
      console.log('  lb status                   Show what you\'re working on');
      console.log('  lb alerts                   Show priority alerts\n');

      console.log('Problem Management:');
      console.log('  lb p list [status]          List problems (filter by status)');
      console.log('  lb p show <id>              Show problem details');
      console.log('  lb p status <id> <status>   Update problem status');
      console.log('  lb p priority <id> <pri>    Update problem priority');
      console.log('  lb p breakdown <id>         AI breakdown into tasks');
      console.log('  lb p approve <id>           Approve suggested tasks');
      console.log('  lb p reject <id>            Reject suggested tasks\n');

      console.log('Task Management:');
      console.log('  lb t create "task" --problem <id>  Create task');
      console.log('  lb t list <problem-id>      List tasks for problem');
      console.log('  lb t show <id>              Show task details');
      console.log('  lb t status <id> <status>   Update task status');
      console.log('  lb t done <id>              Mark task as done');
      console.log('  lb t delete <id>            Delete task');
      console.log('  lb t breakdown <id>         Break down task into subtasks\n');

      console.log('Board & Stats:');
      console.log('  lb board                    Show full Kanban board');
      console.log('  lb board --problem=<id>     Show tasks for problem');
      console.log('  lb stats                    Show statistics\n');

      console.log('Notifications:');
      console.log('  lb alerts                   Show priority alerts');
      console.log('  lb notify list              List all notifications');
      console.log('  lb notify read <id>         Mark notification as read');
      console.log('  lb notify clear             Clear all notifications\n');

      console.log('Legacy Commands:');
      console.log('  lb list                     List all problems (old format)');
      console.log('  lb today                    Show today\'s problems');
      console.log('  lb delete <search>          Delete a problem');
      console.log('  lb search <query>           Search problems');
      console.log('  lb review                   AI review of problems');
      console.log('  lb summary [period]         AI summary (daily/weekly/monthly)\n');

      console.log('Configuration:');
      console.log('  lb config setup             Configure AI settings');
      console.log('  lb config show              Show current configuration');
      console.log('  lb config set <key> <val>   Set a configuration value\n');

      console.log('Other:');
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
