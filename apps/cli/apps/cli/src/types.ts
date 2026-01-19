export interface Problem {
  id: string;
  text: string;
  createdAt: string;
  aiAnalysis?: AIAnalysis;
  tags?: string[];
}

export interface Storage {
  problems: Problem[];
}

export interface AIAnalysis {
  summary: string;
  relatedProblems: string[];
  suggestedSolutions: string[];
  category: string;
  analyzedAt: string;
  cached: boolean;
}

export interface ReviewOptions {
  all?: boolean;
  last?: number;
  from?: string;
  to?: string;
  topic?: string;
}

export interface ReviewResult {
  patterns: Pattern[];
  suggestions: string[];
  resources: Resource[];
}

export interface Pattern {
  name: string;
  count: number;
  problems: string[];
  description: string;
}

export interface Resource {
  title: string;
  url: string;
  description: string;
}

export interface Summary {
  period: 'daily' | 'weekly' | 'monthly';
  overview: {
    totalProblems: number;
    categories: { [key: string]: number };
    mostActiveTime?: string;
  };
  patterns: Pattern[];
  trends: string[];
  metaLearning: string[];
  recommendations: string[];
}
