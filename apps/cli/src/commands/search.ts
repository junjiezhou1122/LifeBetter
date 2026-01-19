import { searchProblems, formatTimeAgo } from '../storage.js';
import * as ui from '../ui.js';
import chalk from 'chalk';

export function searchCommand(args: string[]): void {
  try {
    // Join all args to support multi-word queries
    const query = args.join(' ').trim();

    if (!query) {
      ui.error('Please provide a search query');
      console.log(chalk.gray('Usage: ') + chalk.cyan('lb search <query>'));
      return;
    }

    // Search for matching problems
    const results = searchProblems(query);

    if (results.length === 0) {
      ui.warning(`No problems found matching "${query}"`);
      console.log(chalk.gray('Try: ') + chalk.cyan('lb list') + chalk.gray(' - to see all problems'));
      return;
    }

    // Display results
    ui.header(`Found ${results.length} problem${results.length === 1 ? '' : 's'} matching "${query}"`, '🔍');

    // Sort by date (newest first) and display
    const sortedResults = results.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    sortedResults.forEach((problem, index) => {
      const num = sortedResults.length - index;
      const timeAgo = formatTimeAgo(problem.createdAt);
      const highlightedText = ui.highlightMatch(problem.text, query);

      // Display using problem format but with highlighted text
      const indexStr = chalk.hex('#a8a29e')(`[${num}]`);
      const timeStr = chalk.hex('#a8a29e')(timeAgo);

      console.log(`${indexStr} ${timeStr}`);
      console.log(`    ${highlightedText}\n`);
    });

  } catch (error) {
    ui.error((error as Error).message);
    process.exit(1);
  }
}
