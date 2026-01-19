import { createTask, getTasksForProblem, getTaskById, updateTask, deleteTask, getProblemById } from '../storage.js';
import { aiAgent } from '../ai/agent.js';
import { isAIEnabled } from '../config.js';
import * as ui from '../ui.js';
import chalk from 'chalk';
import prompts from 'prompts';

export async function taskCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (!subcommand) {
    ui.error('Task subcommand required');
    showUsage();
    process.exit(1);
  }

  try {
    switch (subcommand) {
      case 'create':
      case 'add':
        await createTaskCommand(args.slice(1));
        break;

      case 'list':
        await listTasksCommand(args.slice(1));
        break;

      case 'show':
        await showTaskCommand(args.slice(1));
        break;

      case 'status':
        await updateTaskStatusCommand(args.slice(1));
        break;

      case 'done':
        await markTaskDoneCommand(args.slice(1));
        break;

      case 'delete':
        await deleteTaskCommand(args.slice(1));
        break;

      case 'breakdown':
        await breakdownTaskCommand(args.slice(1));
        break;

      default:
        // If no subcommand, treat as quick create
        await quickCreateTask(args);
        break;
    }
  } catch (error) {
    ui.error((error as Error).message);
    process.exit(1);
  }
}

async function createTaskCommand(args: string[]): Promise<void> {
  const problemIdIndex = args.indexOf('--problem');
  const parentIdIndex = args.indexOf('--parent');

  let problemId: string | undefined;
  let parentTaskId: string | undefined;
  let title: string;

  if (problemIdIndex !== -1 && args[problemIdIndex + 1]) {
    problemId = args[problemIdIndex + 1];
    title = args.filter((_, i) => i < problemIdIndex || i > problemIdIndex + 1).join(' ');
  } else if (parentIdIndex !== -1 && args[parentIdIndex + 1]) {
    parentTaskId = args[parentIdIndex + 1];
    title = args.filter((_, i) => i < parentIdIndex || i > parentIdIndex + 1).join(' ');

    // Get problem ID from parent task
    const parentTask = getTaskById(parentTaskId);
    if (!parentTask) {
      ui.error('Parent task not found');
      process.exit(1);
    }
    problemId = parentTask.problemId;
  } else {
    title = args.join(' ');
  }

  if (!title || title.trim().length === 0) {
    ui.error('Task title is required');
    console.log('Usage: lb t create "task title" --problem <problem-id>');
    process.exit(1);
  }

  // If no problem ID, prompt user to select
  if (!problemId) {
    const { getAllProblems } = await import('../storage.js');
    const problems = getAllProblems().filter((p: any) => p.status !== 'done');

    if (problems.length === 0) {
      ui.error('No active problems found. Create a problem first with: lb p "problem"');
      process.exit(1);
    }

    const response = await prompts({
      type: 'select',
      name: 'problemId',
      message: 'Select problem for this task:',
      choices: problems.map((p: any) => ({
        title: `${p.text} (${p.status})`,
        value: p.id
      }))
    });

    if (!response.problemId) {
      ui.warning('Task creation cancelled');
      return;
    }

    problemId = response.problemId;
  }

  const task = createTask(problemId!, title.trim(), undefined, parentTaskId);
  ui.success(`Task created: ${task.title}`);
  console.log(chalk.gray(`ID: ${task.id}`));
}

async function quickCreateTask(args: string[]): Promise<void> {
  // Quick create: lb t "task title" --problem <id>
  await createTaskCommand(args);
}

async function listTasksCommand(args: string[]): Promise<void> {
  const problemId = args[0];

  if (!problemId) {
    ui.error('Problem ID required');
    console.log('Usage: lb t list <problem-id>');
    process.exit(1);
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  const tasks = getTasksForProblem(problemId);

  if (tasks.length === 0) {
    ui.info('No tasks for this problem');
    return;
  }

  ui.header(`Tasks for: ${problem.text}`, '📋');

  tasks.forEach((task, index) => {
    const statusIcon = getStatusIcon(task.status);
    const priorityColor = getPriorityColor(task.priority);

    console.log(`${statusIcon} ${priorityColor(`[${index + 1}]`)} ${chalk.white(task.title)}`);
    if (task.description) {
      console.log(`   ${chalk.gray(task.description)}`);
    }
    console.log(`   ${chalk.gray(`Status: ${task.status} | Priority: ${task.priority} | ID: ${task.id}`)}`);
    console.log('');
  });
}

async function showTaskCommand(args: string[]): Promise<void> {
  const taskId = args[0];

  if (!taskId) {
    ui.error('Task ID required');
    console.log('Usage: lb t show <task-id>');
    process.exit(1);
  }

  const task = getTaskById(taskId);
  if (!task) {
    ui.error('Task not found');
    process.exit(1);
  }

  const statusIcon = getStatusIcon(task.status);
  const priorityColor = getPriorityColor(task.priority);

  console.log('');
  console.log(`${statusIcon} ${chalk.white.bold(task.title)}`);
  console.log('');

  if (task.description) {
    console.log(chalk.white(task.description));
    console.log('');
  }

  console.log(chalk.gray('Status:      ') + chalk.white(task.status));
  console.log(chalk.gray('Priority:    ') + priorityColor(task.priority));
  console.log(chalk.gray('Created:     ') + chalk.white(new Date(task.createdAt).toLocaleString()));
  console.log(chalk.gray('Updated:     ') + chalk.white(new Date(task.updatedAt).toLocaleString()));

  if (task.estimatedHours) {
    console.log(chalk.gray('Estimated:   ') + chalk.white(`${task.estimatedHours}h`));
  }

  if (task.actualHours) {
    console.log(chalk.gray('Actual:      ') + chalk.white(`${task.actualHours}h`));
  }

  if (task.blockedBy && task.blockedBy.length > 0) {
    console.log(chalk.gray('Blocked by:  ') + chalk.red(`${task.blockedBy.length} item(s)`));
  }

  if (task.blocking && task.blocking.length > 0) {
    console.log(chalk.gray('Blocking:    ') + chalk.yellow(`${task.blocking.length} item(s)`));
  }

  console.log(chalk.gray('ID:          ') + chalk.white(task.id));
  console.log('');
}

async function updateTaskStatusCommand(args: string[]): Promise<void> {
  const taskId = args[0];
  const newStatus = args[1] as any;

  if (!taskId || !newStatus) {
    ui.error('Task ID and status required');
    console.log('Usage: lb t status <task-id> <status>');
    console.log('Status: todo | in_progress | blocked | done');
    process.exit(1);
  }

  const validStatuses = ['todo', 'in_progress', 'blocked', 'done'];
  if (!validStatuses.includes(newStatus)) {
    ui.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    process.exit(1);
  }

  const task = updateTask(taskId, { status: newStatus });
  if (!task) {
    ui.error('Task not found');
    process.exit(1);
  }

  ui.success(`Task status updated to: ${newStatus}`);
}

async function markTaskDoneCommand(args: string[]): Promise<void> {
  const taskId = args[0];

  if (!taskId) {
    ui.error('Task ID required');
    console.log('Usage: lb t done <task-id>');
    process.exit(1);
  }

  const task = updateTask(taskId, { status: 'done' });
  if (!task) {
    ui.error('Task not found');
    process.exit(1);
  }

  ui.success(`✓ Task completed: ${task.title}`);
}

async function deleteTaskCommand(args: string[]): Promise<void> {
  const taskId = args[0];

  if (!taskId) {
    ui.error('Task ID required');
    console.log('Usage: lb t delete <task-id>');
    process.exit(1);
  }

  const task = getTaskById(taskId);
  if (!task) {
    ui.error('Task not found');
    process.exit(1);
  }

  const response = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Delete task "${task.title}"?`,
    initial: false
  });

  if (!response.confirm) {
    ui.warning('Deletion cancelled');
    return;
  }

  deleteTask(taskId);
  ui.success('Task deleted');
}

async function breakdownTaskCommand(args: string[]): Promise<void> {
  const taskId = args[0];

  if (!taskId) {
    ui.error('Task ID required');
    console.log('Usage: lb t breakdown <task-id>');
    process.exit(1);
  }

  const task = getTaskById(taskId);
  if (!task) {
    ui.error('Task not found');
    process.exit(1);
  }

  if (!isAIEnabled()) {
    ui.warning('AI features are not enabled');
    console.log(chalk.gray('Run: ') + chalk.cyan('lb config setup'));
    process.exit(1);
  }

  const spinner = ui.spinner('Breaking down task...');
  spinner.start();

  try {
    const subtasks = await aiAgent.breakdownTask(task);
    spinner.stop();

    if (subtasks.length === 0) {
      ui.info('Task is already small enough, no breakdown needed');
      return;
    }

    console.log('');
    ui.header(`Suggested subtasks for: ${task.title}`, '🤖');

    subtasks.forEach((subtask: any, index: number) => {
      console.log(chalk.hex('#f97316')(`  ${index + 1}.`) + ' ' + chalk.white(subtask.title));
      if (subtask.description) {
        console.log('     ' + chalk.gray(subtask.description));
      }
      if (subtask.estimatedHours) {
        console.log('     ' + chalk.gray(`⏱️  ${subtask.estimatedHours}h`));
      }
      console.log('');
    });

    const response = await prompts({
      type: 'confirm',
      name: 'approve',
      message: 'Create these subtasks?',
      initial: true
    });

    if (response.approve) {
      for (const subtask of subtasks) {
        createTask(task.problemId, subtask.title, subtask.description, task.id);
      }
      ui.success(`${subtasks.length} subtasks created`);
    } else {
      ui.warning('Subtask creation cancelled');
    }
  } catch (error) {
    spinner.stop();
    ui.error('Breakdown failed: ' + (error as Error).message);
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'done': return '✅';
    case 'in_progress': return '🔄';
    case 'blocked': return '🚫';
    default: return '⬜';
  }
}

function getPriorityColor(priority: string): (text: string) => string {
  switch (priority) {
    case 'urgent': return chalk.red.bold;
    case 'high': return chalk.red;
    case 'medium': return chalk.yellow;
    case 'low': return chalk.gray;
    default: return chalk.white;
  }
}

function showUsage(): void {
  console.log('Usage:');
  console.log('  lb t "task title" --problem <id>    Create task for problem');
  console.log('  lb t "subtask" --parent <id>        Create subtask');
  console.log('  lb t list <problem-id>              List tasks for problem');
  console.log('  lb t show <task-id>                 Show task details');
  console.log('  lb t status <task-id> <status>      Update task status');
  console.log('  lb t done <task-id>                 Mark task as done');
  console.log('  lb t delete <task-id>               Delete task');
  console.log('  lb t breakdown <task-id>            Break down task into subtasks');
}
