import {
  getAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification
} from '../storage.js';
import { aiAgent } from '../ai/agent.js';
import { isAIEnabled } from '../config.js';
import * as ui from '../ui.js';
import chalk from 'chalk';

export async function alertsCommand(args: string[]): Promise<void> {
  if (!isAIEnabled()) {
    ui.warning('AI features are not enabled');
    console.log(chalk.gray('Run: ') + chalk.cyan('lb config setup'));
    process.exit(1);
  }

  const spinner = ui.spinner('Calculating priority alerts...');
  spinner.start();

  try {
    // Generate fresh notifications
    const notifications = await aiAgent.generatePriorityNotifications();
    spinner.stop();

    if (notifications.length === 0) {
      ui.success('✓ No urgent alerts - you\'re doing great!');
      return;
    }

    ui.header(`🚨 Priority Alerts (${notifications.length})`, '⚠️');

    // Group by priority
    const urgent = notifications.filter(n => n.priority === 'urgent');
    const high = notifications.filter(n => n.priority === 'high');
    const medium = notifications.filter(n => n.priority === 'medium');

    if (urgent.length > 0) {
      console.log(chalk.red.bold('\n🔴 URGENT'));
      console.log(chalk.gray('─'.repeat(60)));
      urgent.forEach(n => displayNotification(n));
    }

    if (high.length > 0) {
      console.log(chalk.red.bold('\n🟠 HIGH PRIORITY'));
      console.log(chalk.gray('─'.repeat(60)));
      high.forEach(n => displayNotification(n));
    }

    if (medium.length > 0) {
      console.log(chalk.yellow.bold('\n🟡 MEDIUM PRIORITY'));
      console.log(chalk.gray('─'.repeat(60)));
      medium.forEach(n => displayNotification(n));
    }

    console.log('');
  } catch (error) {
    spinner.stop();
    ui.error('Failed to generate alerts: ' + (error as Error).message);
  }
}

export async function notificationsCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (!subcommand || subcommand === 'list') {
    await listNotificationsCommand(args.slice(1));
  } else if (subcommand === 'read') {
    await markReadCommand(args.slice(1));
  } else if (subcommand === 'clear') {
    await clearNotificationsCommand();
  } else {
    ui.error(`Unknown subcommand: ${subcommand}`);
    showUsage();
    process.exit(1);
  }
}

async function listNotificationsCommand(args: string[]): Promise<void> {
  const unreadOnly = args.includes('--unread');
  const notifications = getAllNotifications(unreadOnly);

  if (notifications.length === 0) {
    ui.info(unreadOnly ? 'No unread notifications' : 'No notifications');
    return;
  }

  ui.header(`🔔 Notifications (${notifications.length})`, '📬');

  notifications.forEach(n => {
    const readIcon = n.read ? chalk.gray('✓') : chalk.hex('#f97316')('●');
    const typeIcon = getTypeIcon(n.type);
    const priorityColor = getPriorityColor(n.priority);

    console.log(`${readIcon} ${typeIcon} ${priorityColor(n.title)}`);
    console.log(`   ${chalk.white(n.message)}`);
    console.log(`   ${chalk.gray(`ID: ${n.id} | ${new Date(n.createdAt).toLocaleString()}`)}`);
    console.log('');
  });

  if (!unreadOnly) {
    console.log(chalk.gray('Commands:'));
    console.log(chalk.cyan('  lb notify read <id>') + chalk.gray('  - Mark as read'));
    console.log(chalk.cyan('  lb notify clear') + chalk.gray('     - Clear all notifications'));
    console.log('');
  }
}

async function markReadCommand(args: string[]): Promise<void> {
  const notificationId = args[0];

  if (!notificationId) {
    ui.error('Notification ID required');
    console.log('Usage: lb notify read <notification-id>');
    process.exit(1);
  }

  const notification = markNotificationRead(notificationId);
  if (!notification) {
    ui.error('Notification not found');
    process.exit(1);
  }

  ui.success('Notification marked as read');
}

async function clearNotificationsCommand(): Promise<void> {
  markAllNotificationsRead();
  ui.success('All notifications marked as read');
}

export async function statusCommand(): Promise<void> {
  const { getAllProblems, getAllTasks } = await import('../storage.js');
  const problems = getAllProblems();
  const tasks = getAllTasks();

  const inProgressProblems = problems.filter(p => p.status === 'in_progress');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const blockedProblems = problems.filter(p => p.status === 'blocked');
  const blockedTasks = tasks.filter(t => t.status === 'blocked');

  ui.header('📊 Current Status', '🎯');

  if (inProgressProblems.length === 0 && inProgressTasks.length === 0) {
    console.log(chalk.yellow('⚠️  Nothing in progress'));
    console.log(chalk.gray('Start working on something with: ') + chalk.cyan('lb p status <id> in_progress'));
    console.log('');
  } else {
    if (inProgressProblems.length > 0) {
      console.log(chalk.hex('#f97316').bold('🔄 IN PROGRESS PROBLEMS'));
      console.log(chalk.gray('─'.repeat(60)));
      inProgressProblems.forEach(p => {
        const priorityIcon = getPriorityIcon(p.priority);
        console.log(`${priorityIcon} ${chalk.white(p.text)}`);
        console.log(`   ${chalk.gray(`ID: ${p.id}`)}`);
        console.log('');
      });
    }

    if (inProgressTasks.length > 0) {
      console.log(chalk.hex('#f97316').bold('🔄 IN PROGRESS TASKS'));
      console.log(chalk.gray('─'.repeat(60)));
      inProgressTasks.forEach(t => {
        const priorityIcon = getPriorityIcon(t.priority);
        console.log(`${priorityIcon} ${chalk.white(t.title)}`);
        console.log(`   ${chalk.gray(`ID: ${t.id}`)}`);
        console.log('');
      });
    }
  }

  if (blockedProblems.length > 0 || blockedTasks.length > 0) {
    console.log(chalk.red.bold('🚫 BLOCKED ITEMS'));
    console.log(chalk.gray('─'.repeat(60)));

    blockedProblems.forEach(p => {
      console.log(chalk.red(`Problem: ${p.text}`));
      console.log(`   ${chalk.gray(`Blocked by ${p.blockedBy?.length || 0} item(s)`)}`);
      console.log('');
    });

    blockedTasks.forEach(t => {
      console.log(chalk.red(`Task: ${t.title}`));
      console.log(`   ${chalk.gray(`Blocked by ${t.blockedBy?.length || 0} item(s)`)}`);
      console.log('');
    });
  }

  // Show quick stats
  const todoProblems = problems.filter(p => p.status === 'todo').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  if (todoProblems > 0 || todoTasks > 0) {
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.gray(`📝 ${todoProblems} problems and ${todoTasks} tasks waiting in TODO`));
    console.log('');
  }
}

function displayNotification(notification: any): void {
  const typeIcon = getTypeIcon(notification.type);
  console.log(`${typeIcon} ${chalk.white.bold(notification.title)}`);
  console.log(`   ${chalk.white(notification.message)}`);
  console.log('');
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'priority': return '🚨';
    case 'blocking': return '🚫';
    case 'context': return '💡';
    case 'reminder': return '⏰';
    default: return '📌';
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
  console.log('  lb notify list [--unread]    List all notifications');
  console.log('  lb notify read <id>          Mark notification as read');
  console.log('  lb notify clear              Clear all notifications');
}
