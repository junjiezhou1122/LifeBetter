import { addProblem, getAllProblems, updateProblem } from '../storage.js';
import { isAIEnabled, readConfig } from '../config.js';
import { getAIProvider } from '../ai/index.js';
import * as ui from '../ui.js';

export async function problemCommand(text: string, noAI: boolean = false): Promise<void> {
  // Validate input
  if (!text || text.trim().length === 0) {
    ui.error('Problem text is required');
    console.log('Usage: lb p <problem>');
    process.exit(1);
  }

  // Add problem
  try {
    const problem = addProblem(text.trim());
    ui.success('Problem logged');

    // AI analysis if enabled
    const config = readConfig();
    if (!noAI && isAIEnabled() && config.instantAnalysis) {
      const loadingSpinner = ui.spinner('Analyzing with AI...');
      loadingSpinner.start();

      try {
        const provider = getAIProvider();
        const recentProblems = getAllProblems().slice(0, 10);
        const analysis = await provider.analyze(problem, recentProblems);

        loadingSpinner.stop();

        // Update problem with analysis
        updateProblem(problem.id, { aiAnalysis: analysis });

        // Display beautiful AI insight
        ui.aiInsight(
          analysis.summary,
          analysis.suggestedSolutions,
          analysis.relatedProblems.length
        );
      } catch (error) {
        loadingSpinner.stop();
        ui.warning('AI analysis failed: ' + (error as Error).message);
      }
    }
  } catch (error) {
    ui.error((error as Error).message);
    process.exit(1);
  }
}
