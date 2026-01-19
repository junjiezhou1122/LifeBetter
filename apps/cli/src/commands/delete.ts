import prompts from 'prompts';
import { searchProblems, deleteProblem, formatTimeAgo } from '../storage.js';

export async function deleteCommand(searchText: string): Promise<void> {
  if (!searchText || searchText.trim().length === 0) {
    console.error('Error: Search text is required');
    console.error('Usage: lb delete <search-text>');
    process.exit(1);
  }

  try {
    const matches = searchProblems(searchText.trim());

    if (matches.length === 0) {
      console.log(`No problems found matching "${searchText}"`);
      console.log('Try: lb list');
      return;
    }

    if (matches.length === 1) {
      // Single match - simple confirmation
      const problem = matches[0];
      console.log('\nFound 1 matching problem:');
      console.log(`${formatTimeAgo(problem.createdAt)}`);
      console.log(`    ${problem.text}\n`);

      const response = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'Delete this problem?',
        initial: false,
      });

      if (response.confirm) {
        deleteProblem(problem.id);
        console.log('✓ Problem deleted');
      } else {
        console.log('Cancelled');
      }
    } else {
      // Multiple matches - interactive selection
      console.log(`\nFound ${matches.length} matching problems:\n`);

      const choices = matches.map((problem, index) => ({
        title: `${problem.text}`,
        description: formatTimeAgo(problem.createdAt),
        value: problem.id,
      }));

      const response = await prompts({
        type: 'select',
        name: 'problemId',
        message: 'Select problem to delete (use ↑↓ arrows, Enter to confirm, Ctrl+C to cancel):',
        choices: choices,
        initial: 0,
      });

      if (response.problemId) {
        const deleted = deleteProblem(response.problemId);
        if (deleted) {
          console.log('✓ Problem deleted');
        } else {
          console.error('Error: Problem not found');
        }
      } else {
        console.log('Cancelled');
      }
    }
  } catch (error) {
    if ((error as any).message === 'User force closed the prompt') {
      console.log('\nCancelled');
      return;
    }
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}
