import { getAllProblems, formatTimeAgo } from '../storage.js';

export function listCommand(): void {
  try {
    const problems = getAllProblems();

    if (problems.length === 0) {
      console.log('No problems logged yet');
      console.log('Try: lb p "Your first problem"');
      return;
    }

    console.log(`${problems.length} problem${problems.length === 1 ? '' : 's'} total\n`);

    problems.forEach((problem, index) => {
      const num = problems.length - index;
      const timeAgo = formatTimeAgo(problem.createdAt);
      console.log(`[${num}] ${timeAgo}`);
      console.log(`    ${problem.text}\n`);
    });
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}
