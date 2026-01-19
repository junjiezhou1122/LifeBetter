import { getTodayProblems, formatTimeAgo } from '../storage.js';

export function todayCommand(): void {
  try {
    const problems = getTodayProblems();

    if (problems.length === 0) {
      console.log('No problems logged today');
      return;
    }

    console.log(`${problems.length} problem${problems.length === 1 ? '' : 's'} today\n`);

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
