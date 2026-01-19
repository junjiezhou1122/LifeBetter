import { getTodayProblems, getProblemsInRange } from '../storage.js';
import { isAIEnabled } from '../config.js';
import { getAIProvider } from '../ai/index.js';
import type { Problem } from '../types.js';

export async function summaryCommand(args: string[]): Promise<void> {
  try {
    const period = args[0] || 'daily';

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      console.error('Error: Invalid period. Use: daily, weekly, or monthly');
      process.exit(1);
    }

    // Get problems for the period
    let problems: Problem[] = [];
    const now = new Date();

    if (period === 'daily') {
      problems = getTodayProblems();
    } else if (period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      problems = getProblemsInRange(weekAgo, now);
    } else if (period === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      problems = getProblemsInRange(monthAgo, now);
    }

    if (problems.length === 0) {
      console.log(`\nNo problems logged in the ${period} period\n`);
      return;
    }

    const periodLabel = period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly';
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    console.log(`\n📅 ${periodLabel} Summary - ${dateStr}\n`);

    // Check if AI is enabled
    if (!isAIEnabled()) {
      console.log('⚠️  AI features are not enabled.');
      console.log('Run: lb config setup\n');

      // Show basic stats without AI
      console.log(`📊 Overview:\n`);
      console.log(`   • ${problems.length} problem${problems.length === 1 ? '' : 's'} logged\n`);
      return;
    }

    // Get AI summary
    const provider = getAIProvider();
    const summary = await provider.summarize(problems, period as 'daily' | 'weekly' | 'monthly');

    // Display overview
    console.log('📊 Overview:\n');
    console.log(`   • ${summary.overview.totalProblems} problem${summary.overview.totalProblems === 1 ? '' : 's'} logged`);

    if (Object.keys(summary.overview.categories).length > 0) {
      console.log('   • Categories:');
      Object.entries(summary.overview.categories).forEach(([category, count]) => {
        console.log(`     - ${category}: ${count}`);
      });
    }

    if (summary.overview.mostActiveTime) {
      console.log(`   • Most active: ${summary.overview.mostActiveTime}`);
    }
    console.log('');

    // Display patterns
    if (summary.patterns.length > 0) {
      console.log('🔥 Top Patterns:\n');
      summary.patterns.forEach((pattern, i) => {
        console.log(`   ${i + 1}. ${pattern.name} (${pattern.count} problem${pattern.count === 1 ? '' : 's'})`);
        console.log(`      ${pattern.description}\n`);
      });
    }

    // Display trends
    if (summary.trends.length > 0) {
      console.log('📈 Trends:\n');
      summary.trends.forEach((trend, i) => {
        console.log(`   • ${trend}`);
      });
      console.log('');
    }

    // Display meta-learning insights
    if (summary.metaLearning.length > 0) {
      console.log('💪 Meta-Learning Insights:\n');
      summary.metaLearning.forEach((insight, i) => {
        console.log(`   • ${insight}`);
      });
      console.log('');
    }

    // Display recommendations
    if (summary.recommendations.length > 0) {
      console.log('🎯 Recommendations:\n');
      summary.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}
