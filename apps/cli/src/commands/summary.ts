import { getTodayProblems, getProblemsInRange } from '../storage.js';
import { isAIEnabled } from '../config.js';
import { getAIProvider } from '../ai/index.js';
import type { Problem } from '../types.js';
import * as ui from '../ui.js';
import chalk from 'chalk';

export async function summaryCommand(args: string[]): Promise<void> {
  try {
    const period = args[0] || 'daily';

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      ui.error('Invalid period. Use: daily, weekly, or monthly');
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
      ui.warning(`No problems logged in the ${period} period`);
      return;
    }

    const periodLabel = period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly';
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    ui.header(`${periodLabel} Summary - ${dateStr}`, '📅');

    // Check if AI is enabled
    if (!isAIEnabled()) {
      ui.warning('AI features are not enabled');
      console.log(chalk.gray('Run: ') + chalk.cyan('lb config setup') + '\n');

      // Show basic stats without AI
      ui.summaryBox('Overview', [
        { label: 'Problems logged', value: problems.length }
      ]);
      return;
    }

    // Get AI summary with spinner
    const loadingSpinner = ui.spinner('Generating summary...');
    loadingSpinner.start();

    const provider = getAIProvider();
    const summary = await provider.summarize(problems, period as 'daily' | 'weekly' | 'monthly');

    loadingSpinner.stop();

    // Display overview
    const overviewStats: Array<{ label: string; value: string | number | undefined }> = [
      { label: 'Total problems', value: summary.overview.totalProblems }
    ];

    if (Object.keys(summary.overview.categories).length > 0) {
      overviewStats.push({ label: 'Categories', value: Object.keys(summary.overview.categories).length });
    }

    if (summary.overview.mostActiveTime) {
      overviewStats.push({ label: 'Most active', value: summary.overview.mostActiveTime });
    }

    ui.summaryBox('📊 Overview', overviewStats);

    // Display categories breakdown
    if (Object.keys(summary.overview.categories).length > 0) {
      console.log(chalk.bold.cyan('Categories Breakdown:'));
      Object.entries(summary.overview.categories).forEach(([category, count]) => {
        console.log(chalk.gray('  •') + ' ' + chalk.white(category) + chalk.gray(': ') + chalk.yellow(count.toString()));
      });
      console.log('');
    }

    // Display patterns
    if (summary.patterns.length > 0) {
      ui.header('Top Patterns', '🔥');
      ui.patternsTable(summary.patterns);
      console.log('');
    }

    // Display trends
    if (summary.trends.length > 0) {
      ui.header('Trends', '📈');
      ui.trends(summary.trends);
    }

    // Display meta-learning insights
    if (summary.metaLearning.length > 0) {
      ui.header('Meta-Learning Insights', '💪');
      ui.trends(summary.metaLearning);
    }

    // Display recommendations
    if (summary.recommendations.length > 0) {
      ui.header('Recommendations', '🎯');
      ui.suggestions(summary.recommendations);
    }

  } catch (error) {
    ui.error((error as Error).message);
    process.exit(1);
  }
}
