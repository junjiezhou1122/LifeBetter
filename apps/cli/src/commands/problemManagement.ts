import {
  getAllProblems,
  getProblemById,
  updateProblem,
  addBlocker,
  removeBlocker,
  getTasksForProblem,
  createTask
} from '../storage.js';
import { aiAgent } from '../ai/agent.js';
import { isAIEnabled } from '../config.js';
import * as ui from '../ui.js';
import chalk from 'chalk';
import prompts from 'prompts';
import type { ProblemStatus, Priority } from '../types.js';

export async function problemManagementCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (!subcommand) {
    ui.error('Problem subcommand required');
    showUsage();
    process.exit(1);
  }

  try {
    switch (subcommand) {
      case 'list':
        await listProblemsCommand(args.slice(1));
        break;

      case 'show':
        await showProblemCommand(args.slice(1));
        break;

      case 'status':
        await updateProblemStatusCommand(args.slice(1));
        break;

      case 'priority':
        await updateProblemPriorityCommand(args.slice(1));
        break;

      case 'breakdown':
        await breakdownProblemCommand(args.slice(1));
        break;

      case 'approve':
        await approveBreakdownCommand(args.slice(1));
        break;

      case 'reject':
        await rejectBreakdownCommand(args.slice(1));
        break;

      default:
        ui.error(`Unknown subcommand: ${subcommand}`);
        showUsage();
        process.exit(1);
    }
  } catch (error) {
    ui.error((error as Error).message);
    process.exit(1);
  }
}

async function listProblemsCommand(args: string[]): Promise<void> {
  const statusFilter = args[0] as ProblemStatus | undefined;
  let problems = getAllProblems();

  if (statusFilter) {
    problems = problems.filter(p => p.status === statusFilter);
  }

  if (problems.length === 0) {
    ui.info(statusFilter ? `No problems with status: ${statusFilter}` : 'No problems found');
    return;
  }

  ui.header(`${problems.length} Problem${problems.length === 1 ? '' : 's'}${statusFilter ? ` (${statusFilter})` : ''}`, '📋');

  // Group by status
  const grouped: Record<string, typeof problems> = {};
  problems.forEach(p => {
    if (!grouped[p.status]) grouped[p.status] = [];
    grouped[p.status].push(p);
  });

  const statusOrder: ProblemStatus[] = ['in_progress', 'todo', 'blocked', 'backlog', 'done'];

  statusOrder.forEach(status => {
    const items = grouped[status];
    if (!items || items.length === 0) return;

    console.log(chalk.hex('#f97316').bold(`\n${status.toUpperCase().replace('_', ' ')} (${items.length})`));
    console.log(chalk.gray('─'.repeat(60)));

    items.forEach(problem => {
      const priorityIcon = getPriorityIcon(problem.priority);
      const statusIcon = getStatusIcon(problem.status);
      const tasks = getTasksForProblem(problem.id);
      const taskInfo = tasks.length > 0 ? chalk.gray(` [${tasks.length} tasks]`) : '';

      console.log(`${statusIcon} ${priorityIcon} ${chalk.white(problem.text)}${taskInfo}`);
      console.log(`   ${chalk.gray(`ID: ${problem.id} | Created: ${new Date(problem.createdAt).toLocaleDateString()}`)}`);

      if (problem.blockedBy && problem.blockedBy.length > 0) {
        console.log(`   ${chalk.red(`🚫 Blocked by ${problem.blockedBy.length} item(s)`)}`);
      }

      if (problem.blocking && problem.blocking.length > 0) {
        console.log(`   ${chalk.yellow(`⚠️  Blocking ${problem.blocking.length} item(s)`)}`);
      }

      console.log('');
    });
  });
}

async function showProblemCommand(args: string[]): Promise<void> {
  const problemId = args[0];

  if (!problemId) {
    ui.error('Problem ID required');
    console.log('Usage: lb p show <problem-id>');
    process.exit(1);
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  const statusIcon = getStatusIcon(problem.status);
  const priorityIcon = getPriorityIcon(problem.priority);

  console.log('');
  console.log(`${statusIcon} ${priorityIcon} ${chalk.white.bold(problem.text)}`);
  console.log('');

  console.log(chalk.gray('Status:           ') + chalk.white(problem.status));
  console.log(chalk.gray('Priority:         ') + getPriorityColor(problem.priority)(problem.priority));
  console.log(chalk.gray('Breakdown Status: ') + chalk.white(problem.breakdownStatus));
  console.log(chalk.gray('Created:          ') + chalk.white(new Date(problem.createdAt).toLocaleString()));
  console.log(chalk.gray('Updated:          ') + chalk.white(new Date(problem.updatedAt).toLocaleString()));

  if (problem.estimatedHours) {
    console.log(chalk.gray('Estimated:        ') + chalk.white(`${problem.estimatedHours}h`));
  }

  if (problem.actualHours) {
    console.log(chalk.gray('Actual:           ') + chalk.white(`${problem.actualHours}h`));
  }

  if (problem.dueDate) {
    console.log(chalk.gray('Due Date:         ') + chalk.white(new Date(problem.dueDate).toLocaleString()));
  }

  if (problem.tags && problem.tags.length > 0) {
    console.log(chalk.gray('Tags:             ') + chalk.white(problem.tags.join(', ')));
  }

  if (problem.blockedBy && problem.blockedBy.length > 0) {
    console.log(chalk.gray('Blocked by:       ') + chalk.red(`${problem.blockedBy.length} item(s)`));
  }

  if (problem.blocking && problem.blocking.length > 0) {
    console.log(chalk.gray('Blocking:         ') + chalk.yellow(`${problem.blocking.length} item(s)`));
  }

  console.log(chalk.gray('ID:               ') + chalk.white(problem.id));

  // Show AI analysis if available
  if (problem.aiAnalysis) {
    console.log('');
    ui.aiInsight(
      problem.aiAnalysis.summary,
      problem.aiAnalysis.suggestedSolutions,
      problem.aiAnalysis.relatedProblems.length
    );
  }

  // Show tasks
  const tasks = getTasksForProblem(problem.id);
  if (tasks.length > 0) {
    console.log('');
    console.log(chalk.hex('#f97316').bold(`TASKS (${tasks.length})`));
    console.log(chalk.gray('─'.repeat(60)));

    tasks.forEach((task, index) => {
      const taskStatusIcon = getStatusIcon(task.status);
      console.log(`${taskStatusIcon} ${chalk.white(`${index + 1}. ${task.title}`)}`);
      console.log(`   ${chalk.gray(`Status: ${task.status} | Priority: ${task.priority}`)}`);
    });
  }

  console.log('');
}

async function updateProblemStatusCommand(args: string[]): Promise<void> {
  const problemId = args[0];
  const newStatus = args[1] as ProblemStatus;

  if (!problemId || !newStatus) {
    ui.error('Problem ID and status required');
    console.log('Usage: lb p status <problem-id> <status>');
    console.log('Status: backlog | todo | in_progress | blocked | done');
    process.exit(1);
  }

  const validStatuses: ProblemStatus[] = ['backlog', 'todo', 'in_progress', 'blocked', 'done'];
  if (!validStatuses.includes(newStatus)) {
    ui.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    process.exit(1);
  }

  const problem = updateProblem(problemId, { status: newStatus });
  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  ui.success(`Problem status updated to: ${newStatus}`);
}

async function updateProblemPriorityCommand(args: string[]): Promise<void> {
  const problemId = args[0];
  const newPriority = args[1] as Priority;

  if (!problemId || !newPriority) {
    ui.error('Problem ID and priority required');
    console.log('Usage: lb p priority <problem-id> <priority>');
    console.log('Priority: low | medium | high | urgent');
    process.exit(1);
  }

  const validPriorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(newPriority)) {
    ui.error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    process.exit(1);
  }

  const problem = updateProblem(problemId, { priority: newPriority });
  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  ui.success(`Problem priority updated to: ${newPriority}`);
}

async function breakdownProblemCommand(args: string[]): Promise<void> {
  const problemId = args[0];

  if (!problemId) {
    ui.error('Problem ID required');
    console.log('Usage: lb p breakdown <problem-id>');
    process.exit(1);
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  if (!isAIEnabled()) {
    ui.warning('AI features are not enabled');
    console.log(chalk.gray('Run: ') + chalk.cyan('lb config setup'));
    process.exit(1);
  }

  const spinner = ui.spinner('Breaking down problem...');
  spinner.start();

  try {
    const suggestedTasks = await aiAgent.breakdownProblem(problem);
    spinner.stop();

    console.log('');
    ui.header(`🤖 AI Breakdown Suggestion for: ${problem.text}`, '💡');

    console.log(chalk.white(`I suggest breaking this into ${suggestedTasks.length} tasks:\n`));

    suggestedTasks.forEach((task: any, index: number) => {
      const priorityColor = getPriorityColor(task.priority || 'medium');
      console.log(priorityColor(`  ${index + 1}. ${task.title}`));
      if (task.description) {
        console.log(`     ${chalk.gray(task.description)}`);
      }
      if (task.estimatedHours) {
        console.log(`     ${chalk.gray(`⏱️  Est: ${task.estimatedHours}h`)}`);
      }
      console.log('');
    });

    // Save suggested tasks
    updateProblem(problemId, {
      breakdownStatus: 'suggested',
      suggestedTasks: suggestedTasks as any
    });

    console.log(chalk.hex('#f97316')('To create these tasks, run:'));
    console.log(chalk.cyan(`  lb p approve ${problemId}`));
    console.log('');
    console.log(chalk.gray('Or reject with:'));
    console.log(chalk.gray(`  lb p reject ${problemId}`));
    console.log('');

  } catch (error) {
    spinner.stop();
    ui.error('Breakdown failed: ' + (error as Error).message);
  }
}

async function approveBreakdownCommand(args: string[]): Promise<void> {
  const problemId = args[0];

  if (!problemId) {
    ui.error('Problem ID required');
    console.log('Usage: lb p approve <problem-id>');
    process.exit(1);
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  if (problem.breakdownStatus !== 'suggested' || !problem.suggestedTasks) {
    ui.error('No suggested tasks to approve. Run: lb p breakdown <problem-id>');
    process.exit(1);
  }

  // Create tasks
  for (const suggestedTask of problem.suggestedTasks) {
    createTask(
      problemId,
      suggestedTask.title,
      (suggestedTask as any).description,
      undefined
    );
  }

  // Update problem
  updateProblem(problemId, {
    breakdownStatus: 'approved',
    suggestedTasks: undefined
  });

  ui.success(`✓ ${problem.suggestedTasks.length} tasks created and added to problem`);
  console.log(chalk.gray('View tasks with: ') + chalk.cyan(`lb t list ${problemId}`));
}

async function rejectBreakdownCommand(args: string[]): Promise<void> {
  const problemId = args[0];

  if (!problemId) {
    ui.error('Problem ID required');
    console.log('Usage: lb p reject <problem-id>');
    process.exit(1);
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    ui.error('Problem not found');
    process.exit(1);
  }

  updateProblem(problemId, {
    breakdownStatus: 'rejected',
    suggestedTasks: undefined
  });

  ui.success('Breakdown suggestion rejected');
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'done': return '✅';
    case 'in_progress': return '🔄';
    case 'blocked': return '🚫';
    case 'todo': return '📝';
    case 'backlog': return '📦';
    default: return '⬜';
  }
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
  console.log('  lb p list [status]              List all problems (optionally filter by status)');
  console.log('  lb p show <id>                  Show problem details');
  console.log('  lb p status <id> <status>       Update problem status');
  console.log('  lb p priority <id> <priority>   Update problem priority');
  console.log('  lb p breakdown <id>             Request AI breakdown');
  console.log('  lb p approve <id>               Approve and create suggested tasks');
  console.log('  lb p reject <id>                Reject suggested tasks');
}
