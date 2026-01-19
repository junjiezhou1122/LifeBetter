export type ProblemStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type BreakdownStatus = 'pending' | 'suggested' | 'approved' | 'rejected';

export interface Problem {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: AIAnalysis;
  tags?: string[];

  // New fields for Kanban
  status: ProblemStatus;
  priority: Priority;
  breakdownStatus: BreakdownStatus;
  suggestedTasks?: Task[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  blockedBy?: string[];  // IDs of blocking items
  blocking?: string[];   // IDs of items this blocks
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export interface Task {
  id: string;
  problemId: string;
  parentTaskId?: string;  // For subtasks
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  order: number;
  createdAt: string;
  updatedAt: string;

  // Breakdown
  canBreakdown: boolean;
  subtasks?: Task[];

  // Tracking
  estimatedHours?: number;
  actualHours?: number;
  blockedBy?: string[];
  blocking?: string[];

  // Resources
  resources?: Resource[];
}

export type NotificationType = 'priority' | 'blocking' | 'context' | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  relatedId: string;
  priority: Priority;
  read: boolean;
  createdAt: string;
}

export interface Storage {
  problems: Problem[];
  tasks: Task[];
  notifications: Notification[];
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
