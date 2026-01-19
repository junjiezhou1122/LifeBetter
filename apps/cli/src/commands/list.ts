import { getAllProblems, formatTimeAgo } from '../storage.js';
import * as ui from '../ui.js';
import chalk from 'chalk';

export function listCommand(): void {
  try {
    const problems = getAllProblems();

    if (problems.length === 0) {
      ui.info('No problems logged yet');
      console.log(chalk.gray('Try: ') + chalk.cyan('lb p "Your first problem"'));
      return;
    }

    ui.header(`📋 ${problems.length} Problem${problems.length === 1 ? '' : 's'} Total`);

    problems.forEach((problem, index) => {
      const num = problems.length - index;
      const timeAgo = formatTimeAgo(problem.createdAt);
      ui.problem(num, timeAgo, problem.text);
    });
  } catch (error) {
    ui.error((error as Error).message);
    process.exit(1);
  }
}
