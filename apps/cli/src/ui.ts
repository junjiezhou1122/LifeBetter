import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import Table from 'cli-table3';

/**
 * Display a success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓') + ' ' + chalk.white(message));
}

/**
 * Display an error message
 */
export function error(message: string): void {
  console.log(chalk.red('✗') + ' ' + chalk.white(message));
}

/**
 * Display a warning message
 */
export function warning(message: string): void {
  console.log(chalk.yellow('⚠') + ' ' + chalk.white(message));
}

/**
 * Display an info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ') + ' ' + chalk.white(message));
}

/**
 * Display a section header
 */
export function header(text: string, icon?: string): void {
  const displayText = icon ? `${icon} ${text}` : text;
  console.log('\n' + chalk.bold.cyan(displayText) + '\n');
}

/**
 * Display AI insight in a beautiful box
 */
export function aiInsight(summary: string, solutions: string[], relatedCount: number): void {
  let content = chalk.white(summary);

  if (relatedCount > 0) {
    content += '\n\n' + chalk.gray(`🔗 Related problems: ${relatedCount} found`);
  }

  if (solutions.length > 0) {
    content += '\n\n' + chalk.bold('💡 Suggested Solutions:');
    solutions.forEach((solution, i) => {
      content += '\n' + chalk.cyan(`  ${i + 1}.`) + ' ' + chalk.white(solution);
    });
  }

  console.log('\n' + boxen(content, {
    padding: 1,
    margin: 0,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: '🤖 AI Analysis',
    titleAlignment: 'left',
  }));
}

/**
 * Create a spinner for loading states
 */
export function spinner(text: string) {
  return ora({
    text: chalk.cyan(text),
    spinner: 'dots',
  });
}

/**
 * Display a problem in a formatted way
 */
export function problem(index: number, timeAgo: string, text: string, highlight: boolean = false): void {
  const indexStr = chalk.gray(`[${index}]`);
  const timeStr = chalk.dim(timeAgo);
  const textStr = highlight ? chalk.bold.white(text) : chalk.white(text);

  console.log(`${indexStr} ${timeStr}`);
  console.log(`    ${textStr}\n`);
}

/**
 * Display patterns in a table
 */
export function patternsTable(patterns: Array<{ name: string; count: number; description: string }>): void {
  if (patterns.length === 0) return;

  const table = new Table({
    head: [
      chalk.bold.cyan('Pattern'),
      chalk.bold.cyan('Count'),
      chalk.bold.cyan('Description')
    ],
    colWidths: [25, 10, 60],
    wordWrap: true,
    style: {
      head: [],
      border: ['gray']
    }
  });

  patterns.forEach(pattern => {
    table.push([
      chalk.white(pattern.name),
      chalk.yellow(pattern.count.toString()),
      chalk.gray(pattern.description)
    ]);
  });

  console.log(table.toString());
}

/**
 * Display suggestions as a numbered list
 */
export function suggestions(items: string[]): void {
  if (items.length === 0) return;

  items.forEach((item, i) => {
    console.log(chalk.cyan(`  ${i + 1}.`) + ' ' + chalk.white(item));
  });
  console.log('');
}

/**
 * Display resources
 */
export function resources(items: Array<{ title: string; url: string; description: string }>): void {
  if (items.length === 0) return;

  items.forEach((item, i) => {
    console.log(chalk.cyan(`  ${i + 1}.`) + ' ' + chalk.bold.white(item.title));
    if (item.url !== '#') {
      console.log('     ' + chalk.blue.underline(item.url));
    }
    if (item.description) {
      console.log('     ' + chalk.gray(item.description));
    }
    console.log('');
  });
}

/**
 * Display a summary box
 */
export function summaryBox(title: string, stats: Array<{ label: string; value: string | number | undefined }>): void {
  let content = '';

  stats.forEach((stat, i) => {
    if (i > 0) content += '\n';
    content += chalk.gray(stat.label + ': ') + chalk.white(stat.value?.toString() || 'N/A');
  });

  console.log(boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'green',
    title: title,
    titleAlignment: 'center',
  }));
}

/**
 * Display configuration in a nice format
 */
export function configDisplay(config: Record<string, string>): void {
  const table = new Table({
    colWidths: [25, 50],
    wordWrap: true,
    style: {
      head: [],
      border: ['cyan']
    }
  });

  Object.entries(config).forEach(([key, value]) => {
    table.push([
      chalk.cyan(key),
      chalk.white(value)
    ]);
  });

  console.log('\n' + table.toString() + '\n');
}

/**
 * Display a divider
 */
export function divider(): void {
  console.log(chalk.gray('─'.repeat(80)));
}

/**
 * Display trends as bullet points
 */
export function trends(items: string[]): void {
  if (items.length === 0) return;

  items.forEach(item => {
    console.log(chalk.yellow('  •') + ' ' + chalk.white(item));
  });
  console.log('');
}
