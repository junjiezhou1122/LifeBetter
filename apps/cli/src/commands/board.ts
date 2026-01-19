import { getAllProblems, getTasksForProblem, getAllTasks } from '../storage.js';
import * as ui from '../ui.js';
import chalk from 'chalk';
import type { ProblemStatus, TaskStatus } from '../types.js';

export function boardCommand(args: string[]): void {
  const problemId = args.find(arg => arg.startsWith('--problem='))?.split('=')[1];

  if (problemId) {
    showProblemBoard(problemId);
  } else {
    showFullBoard();
  }
}

function showFullBoard(): void {
  const problems = getAllProblems();

  if (problems.length === 0) {
    ui.info('No problems found. Create one with: lb p "problem"');
    return;
  }

  ui.header('📊 Kanban Board', '🎯');

  // Group problems by status
  const columns: Record<ProblemStatus, typeof problems> = {
    backlog: [],
    todo: [],
    in_progress: [],
    blocked: [],
    done: []
  };

  problems.forEach(p => {
    columns[p.status].push(p);
  });

  // Calculate column widths
  const terminalWidth = process.stdout.columns || 120;
  const columnWidth = Math.floor((terminalWidth - 10) / 5);

  // Print column headers
  const headers = ['BACKLOG', 'TODO', 'IN PROGRESS', 'BLOCKED', 'DONE'];
  const headerRow = headers.map(h => {
    const count = columns[h.toLowerCase().replace(' ', '_') as ProblemStatus].length;
    const text = `${h} (${count})`;
    return text.padEnd(columnWidth);
  }).join('│');

  console.log(chalk.hex('#f97316').bold(headerRow));
  console.log(chalk.gray('─'.repeat(terminalWidth)));

  // Find max rows needed
  const maxRows = Math.max(
    columns.backlog.length,
    columns.todo.length,
    columns.in_progress.length,
    columns.blocked.length,
    columns.done.length
  );

  // Print rows
  for (let i = 0; i < maxRows; i++) {
    const cells: string[] = [];

    (['backlog', 'todo', 'in_progress', 'blocked', 'done'] as ProblemStatus[]).forEach(status => {
      const problem = columns[status][i];
      if (problem) {
        const priorityIcon = getPriorityIcon(problem.priority);
        const tasks = getTasksForProblem(problem.id);
        const taskInfo = tasks.length > 0 ? ` [${tasks.length}]` : '';

        // Truncate text to fit column
        const maxTextLength = columnWidth - 6;
        let text = problem.text;
        if (text.length > maxTextLength) {
          text = text.substring(0, maxTextLength - 3) + '...';
        }

        const cell = `${priorityIcon} ${text}${taskInfo}`;
        cells.push(cell.padEnd(columnWidth));
      } else {
        cells.push(' '.repeat(columnWidth));
      }
    });

    console.log(cells.join(chalk.gray('│')));
  }

  console.log('');
  console.log(chalk.gray('Legend: 🔴 Urgent | 🟠 High | 🟡 Medium | 🟢 Low'));
  console.log('');
  console.log(chalk.gray('Commands:'));
  console.log(chalk.cyan('  lb p list') + chalk.gray('           - Detailed problem list'));
  console.log(chalk.cyan('  lb p show <id>') + chalk.gray('      - Show problem details'));
  console.log(chalk.cyan('  lb p status <id> <s>') + chalk.gray(' - Move problem to status'));
  console.log('');
}

function showProblemBoard(problemId: string): void {
  const { getProblemById } = require('../storage.js');
  const problem = getProblemById(problemId);

  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  const tasks = getTasksForProblem(problemId);

  if (tasks.length === 0) {
    ui.info(`No tasks for problem: ${problem.text}`);
    console.log(chalk.gray('Create tasks with: ') + chalk.cyan(`lb p breakdown ${problemId}`));
    return;
  }

  ui.header(`📋 Tasks for: ${problem.text}`, '🎯');

  // Group tasks by status
  const columns: Record<TaskStatus, typeof tasks> = {
    todo: [],
    in_progress: [],
    blocked: [],
    done: []
  };

  tasks.forEach(t => {
    columns[t.status].push(t);
  });

  // Calculate column widths
  const terminalWidth = process.stdout.columns || 120;
  const columnWidth = Math.floor((terminalWidth - 8) / 4);

  // Print column headers
  const headers = ['TODO', 'IN PROGRESS', 'BLOCKED', 'DONE'];
  const headerRow = headers.map(h => {
    const count = columns[h.toLowerCase().replace(' ', '_') as TaskStatus].length;
    const text = `${h} (${count})`;
    return text.padEnd(columnWidth);
  }).join('│');

  console.log(chalk.hex('#f97316').bold(headerRow));
  console.log(chalk.gray('─'.repeat(terminalWidth)));

  // Find max rows needed
  const maxRows = Math.max(
    columns.todo.length,
    columns.in_progress.length,
    columns.blocked.length,
    columns.done.length
  );

  // Print rows
  for (let i = 0; i < maxRows; i++) {
    const cells: string[] = [];

    (['todo', 'in_progress', 'blocked', 'done'] as TaskStatus[]).forEach(status => {
      const task = columns[status][i];
      if (task) {
        const priorityIcon = getPriorityIcon(task.priority);

        // Truncate text to fit column
        const maxTextLength = columnWidth - 6;
        let text = task.title;
        if (text.length > maxTextLength) {
          text = text.substring(0, maxTextLength - 3) + '...';
        }

        const cell = `${priorityIcon} ${text}`;
        cells.push(cell.padEnd(columnWidth));
      } else {
        cells.push(' '.repeat(columnWidth));
      }
    });

    console.log(cells.join(chalk.gray('│')));
  }

  console.log('');
  console.log(chalk.gray('Commands:'));
  console.log(chalk.cyan('  lb t list ' + problemId) + chalk.gray('     - Detailed task list'));
  console.log(chalk.cyan('  lb t show <id>') + chalk.gray('          - Show task details'));
  console.log(chalk.cyan('  lb t status <id> <s>') + chalk.gray('   - Move task to status'));
  console.log('');
}

export function statsCommand(): void {
  const problems = getAllProblems();
  const tasks = getAllTasks();

  if (problems.length === 0) {
    ui.info('No data yet. Start by creating a problem: lb p "problem"');
    return;
  }

  ui.header('📈 Statistics', '📊');

  // Problem stats
  const problemsByStatus = {
    backlog: problems.filter(p => p.status === 'backlog').length,
    todo: problems.filter(p => p.status === 'todo').length,
    in_progress: problems.filter(p => p.status === 'in_progress').length,
    blocked: problems.filter(p => p.status === 'blocked').length,
    done: problems.filter(p => p.status === 'done').length,
  };

  const problemsByPriority = {
    urgent: problems.filter(p => p.priority === 'urgent').length,
    high: problems.filter(p => p.priority === 'high').length,
    medium: problems.filter(p => p.priority === 'medium').length,
    low: problems.filter(p => p.priority === 'low').length,
  };

  console.log(chalk.hex('#f97316').bold('PROBLEMS'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.white(`Total:        ${problems.length}`));
  console.log(chalk.white(`Active:       ${problems.length - problemsByStatus.done}`));
  console.log(chalk.white(`Completed:    ${problemsByStatus.done}`));
  console.log('');
  console.log(chalk.gray('By Status:'));
  console.log(`  Backlog:      ${problemsByStatus.backlog}`);
  console.log(`  Todo:         ${problemsByStatus.todo}`);
  console.log(`  In Progress:  ${problemsByStatus.in_progress}`);
  console.log(`  Blocked:      ${problemsByStatus.blocked}`);
  console.log(`  Done:         ${problemsByStatus.done}`);
  console.log('');
  console.log(chalk.gray('By Priority:'));
  console.log(chalk.red(`  Urgent:       ${problemsByPriority.urgent}`));
  console.log(chalk.red(`  High:         ${problemsByPriority.high}`));
  console.log(chalk.yellow(`  Medium:       ${problemsByPriority.medium}`));
  console.log(chalk.gray(`  Low:          ${problemsByPriority.low}`));

  // Task stats
  if (tasks.length > 0) {
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      done: tasks.filter(t => t.status === 'done').length,
    };

    console.log('');
    console.log(chalk.hex('#f97316').bold('TASKS'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`Total:        ${tasks.length}`));
    console.log(chalk.white(`Active:       ${tasks.length - tasksByStatus.done}`));
    console.log(chalk.white(`Completed:    ${tasksByStatus.done}`));
    console.log('');
    console.log(chalk.gray('By Status:'));
    console.log(`  Todo:         ${tasksByStatus.todo}`);
    console.log(`  In Progress:  ${tasksByStatus.in_progress}`);
    console.log(`  Blocked:      ${tasksByStatus.blocked}`);
    console.log(`  Done:         ${tasksByStatus.done}`);
  }

  console.log('');
}

function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'urgent': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}
