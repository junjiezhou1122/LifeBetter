import axios from 'axios';
import type { Problem, AIAnalysis, ReviewOptions, ReviewResult, Summary } from '../types.js';
import type { AIProvider } from './provider.js';
import { readConfig } from '../config.js';

export class OllamaProvider implements AIProvider {
  private baseURL: string;
  private model: string;

  constructor() {
    const config = readConfig();
    this.baseURL = config.apiBaseUrl || 'http://localhost:11434/v1';
    this.model = config.aiModel;
  }

  private async chat(prompt: string, maxTokens: number = 500): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.7,
        },
        { timeout: 30000 }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`Ollama request failed: ${(error as Error).message}`);
    }
  }

  async analyze(problem: Problem, context: Problem[]): Promise<AIAnalysis> {
    const contextText = context.length > 0
      ? `\n\nRecent problems for context:\n${context.slice(0, 5).map(p => `- ${p.text}`).join('\n')}`
      : '';

    const prompt = `You are a problem-solving assistant. Analyze this problem and provide insights.

Problem: "${problem.text}"${contextText}

Provide a JSON response with:
1. summary: Brief analysis of the problem (1-2 sentences)
2. relatedProblems: Array of indices of related problems from context (if any)
3. suggestedSolutions: Array of 2-3 potential solutions or approaches
4. category: Single category (e.g., "Frontend", "Backend", "DevOps", "Algorithm", "Design")

Keep it concise and actionable. Respond ONLY with valid JSON.`;

    try {
      const content = await this.chat(prompt, 500);
      const parsed = JSON.parse(content);

      const relatedProblems = (parsed.relatedProblems || [])
        .map((idx: number) => context[idx]?.id)
        .filter(Boolean);

      return {
        summary: parsed.summary || 'No summary available',
        relatedProblems,
        suggestedSolutions: parsed.suggestedSolutions || [],
        category: parsed.category || 'General',
        analyzedAt: new Date().toISOString(),
        cached: false,
      };
    } catch (error) {
      console.error('AI analysis failed:', (error as Error).message);
      return {
        summary: 'Analysis unavailable',
        relatedProblems: [],
        suggestedSolutions: [],
        category: 'Unknown',
        analyzedAt: new Date().toISOString(),
        cached: false,
      };
    }
  }

  async review(problems: Problem[], options: ReviewOptions): Promise<ReviewResult> {
    const problemsText = problems.map((p, i) => `${i + 1}. ${p.text}`).join('\n');

    const prompt = `You are a problem-solving coach. Analyze these problems and identify patterns.

Problems:
${problemsText}

Provide a JSON response with:
1. patterns: Array of pattern objects with:
   - name: Pattern name
   - count: Number of problems in this pattern
   - problems: Array of problem indices (1-based)
   - description: What this pattern means
2. suggestions: Array of 3-5 actionable suggestions
3. resources: Array of 2-3 helpful resources with title, url, description

Focus on meta-learning and skill development. Respond ONLY with valid JSON.`;

    try {
      const content = await this.chat(prompt, 1500);
      const parsed = JSON.parse(content);

      return {
        patterns: (parsed.patterns || []).map((p: any) => ({
          name: p.name || 'Unknown Pattern',
          count: p.count || 0,
          problems: (p.problems || []).map((idx: number) => problems[idx - 1]?.id).filter(Boolean),
          description: p.description || '',
        })),
        suggestions: parsed.suggestions || [],
        resources: (parsed.resources || []).map((r: any) => ({
          title: r.title || '',
          url: r.url || '#',
          description: r.description || '',
        })),
      };
    } catch (error) {
      console.error('AI review failed:', (error as Error).message);
      return {
        patterns: [],
        suggestions: ['AI analysis unavailable. Please check your configuration.'],
        resources: [],
      };
    }
  }

  async summarize(problems: Problem[], period: 'daily' | 'weekly' | 'monthly'): Promise<Summary> {
    const problemsText = problems.map((p, i) => `${i + 1}. ${p.text} (${new Date(p.createdAt).toLocaleString()})`).join('\n');

    const prompt = `You are a learning analytics expert. Analyze these ${period} problems and provide insights.

Problems (${problems.length} total):
${problemsText}

Provide a JSON response with:
1. overview: Object with:
   - totalProblems: number
   - categories: Object mapping category names to counts
   - mostActiveTime: string (e.g., "mornings", "afternoons")
2. patterns: Array of pattern objects (same format as review)
3. trends: Array of 2-3 trend observations
4. metaLearning: Array of 2-3 meta-learning insights about problem-solving approach
5. recommendations: Array of 2-3 specific recommendations for next ${period}

Focus on growth and improvement. Respond ONLY with valid JSON.`;

    try {
      const content = await this.chat(prompt, 2000);
      const parsed = JSON.parse(content);

      return {
        period,
        overview: {
          totalProblems: parsed.overview?.totalProblems || problems.length,
          categories: parsed.overview?.categories || {},
          mostActiveTime: parsed.overview?.mostActiveTime,
        },
        patterns: (parsed.patterns || []).map((p: any) => ({
          name: p.name || 'Unknown Pattern',
          count: p.count || 0,
          problems: (p.problems || []).map((idx: number) => problems[idx - 1]?.id).filter(Boolean),
          description: p.description || '',
        })),
        trends: parsed.trends || [],
        metaLearning: parsed.metaLearning || [],
        recommendations: parsed.recommendations || [],
      };
    } catch (error) {
      console.error('AI summary failed:', (error as Error).message);
      return {
        period,
        overview: {
          totalProblems: problems.length,
          categories: {},
        },
        patterns: [],
        trends: ['AI analysis unavailable'],
        metaLearning: [],
        recommendations: [],
      };
    }
  }
}
