import type { Problem, AIAnalysis, ReviewOptions, ReviewResult, Summary } from '../types.js';

export interface AIProvider {
  analyze(problem: Problem, context: Problem[]): Promise<AIAnalysis>;
  review(problems: Problem[], options: ReviewOptions): Promise<ReviewResult>;
  summarize(problems: Problem[], period: 'daily' | 'weekly' | 'monthly'): Promise<Summary>;
}
