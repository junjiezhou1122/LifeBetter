import { addProblem } from '../storage.js';

export function problemCommand(text: string): void {
  // Validate input
  if (!text || text.trim().length === 0) {
    console.error('Error: Problem text is required');
    console.error('Usage: lb p <problem>');
    process.exit(1);
  }

  // Add problem
  try {
    addProblem(text.trim());
    console.log('✓ Problem logged');
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}
