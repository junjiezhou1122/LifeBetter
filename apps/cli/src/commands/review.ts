import { getAllProblems, getTodayProblems, getProblemsInRange } from '../storage.js';
import { isAIEnabled } from '../config.js';
import { getAIProvider } from '../ai/index.js';
import type { ReviewOptions } from '../types.js';
import * as ui from '../ui.js';
import chalk from 'chalk';

export async function reviewCommand(args: string[]): Promise<void> {
  try {
    // Parse options
    const options: ReviewOptions = {};
    let problems = [];

    let i = 0;
    while (i < args.length) {
      const arg = args[i];

      if (arg === '--all') {
        options.all = true;
        i++;
      } else if (arg === '--last') {
        options.last = parseInt(args[i + 1], 10);
        i += 2;
      } else if (arg === '--from') {
        options.from = args[i + 1];
        i += 2;
      } else if (arg === '--to') {
        options.to = args[i + 1];
        i += 2;
      } else if (arg === '--topic') {
        options.topic = args[i + 1];
        i += 2;
      } else {
        i++;
      }
    }

    // Get problems based on options
    if (options.all) {
      problems = getAllProblems();
    } else if (options.last) {
      problems = getAllProblems().slice(0, options.last);
    } else if (options.from && options.to) {
      const from = new Date(options.from);
      const to = new Date(options.to);
      problems = getProblemsInRange(from, to);
    } else if (options.topic) {
      problems = getAllProblems().filter(p =>
        p.text.toLowerCase().includes(options.topic!.toLowerCase())
      );
    } else {
      // Default: today's problems
      problems = getTodayProblems();
    }

    if (problems.length === 0) {
      ui.warning('No problems found for the specified criteria');
      return;
    }

    ui.header(`📊 Analyzing ${problems.length} Problem${problems.length === 1 ? '' : 's'}`, '🔍');

    // Check if AI is enabled
    if (!isAIEnabled()) {
      ui.warning('AI features are not enabled');
      console.log(chalk.gray('Run: ') + chalk.cyan('lb config setup') + '\n');
      return;
    }

    // Get AI analysis with spinner
    const loadingSpinner = ui.spinner('Analyzing patterns...');
    loadingSpinner.start();

    const provider = getAIProvider();
    const result = await provider.review(problems, options);

    loadingSpinner.stop();

    // Display patterns
    if (result.patterns.length > 0) {
      ui.header('Patterns Detected', '🔍');
      ui.patternsTable(result.patterns);
      console.log('');
    }

    // Display suggestions
    if (result.suggestions.length > 0) {
      ui.header('Suggestions', '💡');
      ui.suggestions(result.suggestions);
    }

    // Display resources
    if (result.resources.length > 0) {
      ui.header('Resources', '📚');
      ui.resources(result.resources);
    }

  } catch (error) {
    ui.error((error as Error).message);
    process.exit(1);
  }
}
