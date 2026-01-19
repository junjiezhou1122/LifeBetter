import { addProblem, getAllProblems, updateProblem } from '../storage.js';
import { isAIEnabled, readConfig } from '../config.js';
import { getAIProvider } from '../ai/index.js';

export async function problemCommand(text: string, noAI: boolean = false): Promise<void> {
  // Validate input
  if (!text || text.trim().length === 0) {
    console.error('Error: Problem text is required');
    console.error('Usage: lb p <problem>');
    process.exit(1);
  }

  // Add problem
  try {
    const problem = addProblem(text.trim());
    console.log('✓ Problem logged');

    // AI analysis if enabled
    const config = readConfig();
    if (!noAI && isAIEnabled() && config.instantAnalysis) {
      console.log('\n🤖 Analyzing...');

      try {
        const provider = getAIProvider();
        const recentProblems = getAllProblems().slice(0, 10);
        const analysis = await provider.analyze(problem, recentProblems);

        // Update problem with analysis
        updateProblem(problem.id, { aiAnalysis: analysis });

        // Display quick insight
        console.log('\n💡 AI Quick Insight:');
        console.log(`   ${analysis.summary}`);

        if (analysis.relatedProblems.length > 0) {
          console.log(`\n   Related problems: ${analysis.relatedProblems.length} found`);
        }

        if (analysis.suggestedSolutions.length > 0) {
          console.log('\n   Potential solutions:');
          analysis.suggestedSolutions.forEach((solution, i) => {
            console.log(`   ${i + 1}. ${solution}`);
          });
        }

        console.log('');
      } catch (error) {
        console.error('\n⚠️  AI analysis failed:', (error as Error).message);
        console.log('');
      }
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}
