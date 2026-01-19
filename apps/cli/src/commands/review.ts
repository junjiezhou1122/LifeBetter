import { getAllProblems, getTodayProblems, getProblemsInRange } from '../storage.js';
import { isAIEnabled } from '../config.js';
import { getAIProvider } from '../ai/index.js';
import type { ReviewOptions } from '../types.js';

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
      console.log('No problems found for the specified criteria');
      return;
    }

    console.log(`\n📊 Analyzing ${problems.length} problem${problems.length === 1 ? '' : 's'}...\n`);

    // Check if AI is enabled
    if (!isAIEnabled()) {
      console.log('⚠️  AI features are not enabled.');
      console.log('Run: lb config setup\n');
      return;
    }

    // Get AI analysis
    const provider = getAIProvider();
    const result = await provider.review(problems, options);

    // Display patterns
    if (result.patterns.length > 0) {
      console.log('🔍 Patterns Detected:\n');
      result.patterns.forEach((pattern, i) => {
        console.log(`   ${i + 1}. ${pattern.name} (${pattern.count} problem${pattern.count === 1 ? '' : 's'})`);
        console.log(`      ${pattern.description}\n`);
      });
    }

    // Display suggestions
    if (result.suggestions.length > 0) {
      console.log('💡 Suggestions:\n');
      result.suggestions.forEach((suggestion, i) => {
        console.log(`   ${i + 1}. ${suggestion}`);
      });
      console.log('');
    }

    // Display resources
    if (result.resources.length > 0) {
      console.log('📚 Resources:\n');
      result.resources.forEach((resource, i) => {
        console.log(`   ${i + 1}. ${resource.title}`);
        if (resource.url !== '#') {
          console.log(`      ${resource.url}`);
        }
        if (resource.description) {
          console.log(`      ${resource.description}`);
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}
