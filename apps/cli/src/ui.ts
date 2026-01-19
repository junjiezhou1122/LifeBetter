import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import Table from 'cli-table3';

// Warm orange-themed color palette - energetic and friendly
const colors = {
  // Primary colors - Orange theme
  primary: chalk.hex('#f97316'),      // Vibrant orange - main brand color
  secondary: chalk.hex('#fb923c'),    // Light orange - secondary actions
  accent: chalk.hex('#fdba74'),       // Peach - highlights

  // Status colors
  success: chalk.hex('#22c55e'),      // Green
  error: chalk.hex('#ef4444'),        // Red
  warning: chalk.hex('#eab308'),      // Yellow
  info: chalk.hex('#3b82f6'),         // Blue

  // Text colors
  text: chalk.hex('#fafaf9'),         // Off-white - main text
  textDim: chalk.hex('#a8a29e'),      // Warm gray - secondary text
  textBright: chalk.hex('#ffffff'),   // Pure white - emphasis

  // Special
  ai: chalk.hex('#fb923c'),           // Light orange - AI content
  link: chalk.hex('#60a5fa'),         // Light blue - links
  number: chalk.hex('#fbbf24'),       // Amber - numbers/counts
  highlight: chalk.hex('#fed7aa'),    // Very light orange - highlights
};

/**
 * Display a success message
 */
export function success(message: string): void {
  console.log(colors.success('✓') + ' ' + colors.text(message));
}

/**
 * Display an error message
 */
export function error(message: string): void {
  console.log(colors.error('✗') + ' ' + colors.text(message));
}

/**
 * Display a warning message
 */
export function warning(message: string): void {
  console.log(colors.warning('⚠') + ' ' + colors.text(message));
}

/**
 * Display an info message
 */
export function info(message: string): void {
  console.log(colors.info('ℹ') + ' ' + colors.text(message));
}

/**
 * Display a section header
 */
export function header(text: string, icon?: string): void {
  const displayText = icon ? `${icon} ${text}` : text;
  console.log('\n' + colors.primary.bold(displayText) + '\n');
}

/**
 * Display AI insight in a beautiful box
 */
export function aiInsight(summary: string, solutions: string[], relatedCount: number): void {
  let content = colors.text(summary);

  if (relatedCount > 0) {
    content += '\n\n' + colors.textDim(`🔗 Related problems: `) + colors.number(`${relatedCount}`) + colors.textDim(' found');
  }

  if (solutions.length > 0) {
    content += '\n\n' + colors.ai.bold('💡 Suggested Solutions:');
    solutions.forEach((solution, i) => {
      content += '\n' + colors.number(`  ${i + 1}.`) + ' ' + colors.text(solution);
    });
  }

  console.log('\n' + boxen(content, {
    padding: 1,
    margin: 0,
    borderStyle: 'round',
    borderColor: '#fb923c',
    title: colors.ai.bold('🤖 AI Analysis'),
    titleAlignment: 'left',
  }));
}

/**
 * Create a spinner for loading states
 */
export function spinner(text: string) {
  return ora({
    text: colors.primary(text),
    spinner: 'dots12',
    color: 'yellow',
  });
}

/**
 * Display a problem in a formatted way
 */
export function problem(index: number, timeAgo: string, text: string, highlight: boolean = false): void {
  const indexStr = colors.textDim(`[${index}]`);
  const timeStr = colors.textDim(timeAgo);
  const textStr = highlight ? colors.textBright.bold(text) : colors.text(text);

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
      colors.primary.bold('Pattern'),
      colors.primary.bold('Count'),
      colors.primary.bold('Description')
    ],
    colWidths: [25, 10, 60],
    wordWrap: true,
    style: {
      head: [],
      border: ['dim']
    }
  });

  patterns.forEach(pattern => {
    table.push([
      colors.secondary(pattern.name),
      colors.number.bold(pattern.count.toString()),
      colors.textDim(pattern.description)
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
    console.log(colors.primary(`  ${i + 1}.`) + ' ' + colors.text(item));
  });
  console.log('');
}

/**
 * Display resources
 */
export function resources(items: Array<{ title: string; url: string; description: string }>): void {
  if (items.length === 0) return;

  items.forEach((item, i) => {
    console.log(colors.primary(`  ${i + 1}.`) + ' ' + colors.secondary.bold(item.title));
    if (item.url !== '#') {
      console.log('     ' + colors.link.underline(item.url));
    }
    if (item.description) {
      console.log('     ' + colors.textDim(item.description));
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
    content += colors.textDim(stat.label + ': ') + colors.primary.bold(stat.value?.toString() || 'N/A');
  });

  console.log(boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: '#f97316',
    title: colors.primary.bold(title),
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
      border: ['dim']
    }
  });

  Object.entries(config).forEach(([key, value]) => {
    table.push([
      colors.primary(key),
      colors.text(value)
    ]);
  });

  console.log('\n' + table.toString() + '\n');
}

/**
 * Display a divider
 */
export function divider(): void {
  console.log(colors.textDim('─'.repeat(80)));
}

/**
 * Display trends as bullet points
 */
export function trends(items: string[]): void {
  if (items.length === 0) return;

  items.forEach(item => {
    console.log(colors.secondary('  •') + ' ' + colors.text(item));
  });
  console.log('');
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text: string, query: string): string {
  if (!query) return colors.text(text);

  // Escape special regex characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create case-insensitive regex
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  // Split text by matches and rebuild with highlighting
  const parts = text.split(regex);

  return parts.map(part => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return colors.primary.bold(part);
    }
    return colors.text(part);
  }).join('');
}
