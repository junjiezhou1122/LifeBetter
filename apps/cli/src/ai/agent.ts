import { readConfig } from '../config.js';
import type { Problem, Task, Priority, Notification } from '../types.js';
import { getAllProblems, getAllTasks, getBlockedItems, createNotification } from '../storage.js';
import OpenAI from 'openai';

/**
 * Simple AI Agent for v1
 * Handles problem breakdown and priority calculation
 */
export class AIAgent {
  private client: OpenAI;
  private model: string;

  constructor() {
    const config = readConfig();
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiBaseUrl,
    });
    this.model = config.aiModel;
  }

  /**
   * Clean JSON response by removing markdown code blocks
   */
  private cleanJsonResponse(content: string): string {
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    return cleaned.trim();
  }

  /**
   * Break down a problem into actionable tasks
   */
  async breakdownProblem(problem: Problem): Promise<Task[]> {

    const prompt = `Break down this problem into 3-7 actionable tasks.

Problem: "${problem.text}"

Return a JSON array of tasks with this structure:
[
  {
    "title": "Clear, actionable task title",
    "description": "Brief explanation of what needs to be done",
    "estimatedHours": 2,
    "priority": "medium"
  }
]

Guidelines:
- Keep tasks concrete and achievable
- Each task should be completable in one sitting (1-4 hours)
- Order tasks logically (dependencies first)
- Use priority: "low", "medium", or "high"
- Be specific and actionable

Return ONLY the JSON array, no other text.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Clean markdown code blocks
      const cleaned = this.cleanJsonResponse(content);
      const tasks = JSON.parse(cleaned);

      return tasks;
    } catch (error) {
      console.error('AI breakdown failed:', (error as Error).message);
      // Return fallback tasks
      return [
        {
          title: `Research: ${problem.text}`,
          description: 'Gather information and understand the problem',
          estimatedHours: 1,
          priority: 'medium'
        },
        {
          title: `Plan: ${problem.text}`,
          description: 'Create a detailed plan of action',
          estimatedHours: 1,
          priority: 'medium'
        },
        {
          title: `Execute: ${problem.text}`,
          description: 'Implement the solution',
          estimatedHours: 3,
          priority: 'high'
        }
      ] as any[];
    }
  }

  /**
   * Break down a task into subtasks
   */
  async breakdownTask(task: Task): Promise<Task[]> {
    const prompt = `Break down this task into 2-5 smaller subtasks.

Task: "${task.title}"
Description: "${task.description || 'No description'}"

Return a JSON array of subtasks with this structure:
[
  {
    "title": "Specific subtask",
    "description": "What needs to be done",
    "estimatedHours": 0.5
  }
]

Keep subtasks small and focused (15-60 minutes each).
Return ONLY the JSON array, no other text.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const cleaned = this.cleanJsonResponse(content);
      const subtasks = JSON.parse(cleaned);

      return subtasks;
    } catch (error) {
      console.error('AI task breakdown failed:', (error as Error).message);
      return [];
    }
  }

  /**
   * Calculate priority for a problem based on various factors
   */
  calculatePriority(problem: Problem): Priority {
    let score = 0;

    // Factor 1: Blocking others (highest priority)
    if (problem.blocking && problem.blocking.length > 0) {
      score += problem.blocking.length * 10;
    }

    // Factor 2: Being blocked (medium priority - need to resolve)
    if (problem.blockedBy && problem.blockedBy.length > 0) {
      score += 5;
    }

    // Factor 3: Age (older problems get higher priority)
    const ageInDays = (Date.now() - new Date(problem.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 14) score += 8;
    else if (ageInDays > 7) score += 5;
    else if (ageInDays > 3) score += 2;

    // Factor 4: Current status
    if (problem.status === 'in_progress') score += 7; // In progress should be completed
    if (problem.status === 'blocked') score += 6; // Blocked needs attention

    // Factor 5: Has due date
    if (problem.dueDate) {
      const daysUntilDue = (new Date(problem.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 1) score += 15; // Due today or overdue
      else if (daysUntilDue < 3) score += 10; // Due soon
      else if (daysUntilDue < 7) score += 5;
    }

    // Convert score to priority
    if (score >= 15) return 'urgent';
    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Generate priority-based notifications
   */
  async generatePriorityNotifications(): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const problems = getAllProblems();
    const tasks = getAllTasks();

    // Check for blocked items that are blocking others
    const blockedItems = getBlockedItems();
    for (const item of blockedItems) {
      const blocking = 'blocking' in item ? item.blocking : undefined;
      if (blocking && blocking.length > 0) {
        const itemType = 'problemId' in item ? 'Task' : 'Problem';
        const title = 'title' in item ? item.title : item.text;

        notifications.push({
          type: 'priority',
          title: `${itemType} is blocked but blocking others`,
          message: `"${title}" is blocked but blocking ${blocking.length} other item${blocking.length > 1 ? 's' : ''}. Resolve blockers to unblock downstream work.`,
          relatedId: item.id,
          priority: 'high',
          read: false,
          id: '',
          createdAt: ''
        });
      }
    }

    // Check for old problems in backlog
    for (const problem of problems) {
      if (problem.status === 'backlog') {
        const ageInDays = (Date.now() - new Date(problem.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > 7) {
          notifications.push({
            type: 'reminder',
            title: 'Problem in backlog for over a week',
            message: `"${problem.text}" has been in backlog for ${Math.floor(ageInDays)} days. Consider moving to Todo or breaking it down.`,
            relatedId: problem.id,
            priority: 'medium',
            read: false,
            id: '',
            createdAt: ''
          });
        }
      }
    }

    // Check for tasks in progress for too long
    for (const task of tasks) {
      if (task.status === 'in_progress') {
        const ageInDays = (Date.now() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > 3) {
          notifications.push({
            type: 'reminder',
            title: 'Task in progress for over 3 days',
            message: `"${task.title}" has been in progress for ${Math.floor(ageInDays)} days. Is it blocked or can it be completed?`,
            relatedId: task.id,
            priority: 'medium',
            read: false,
            id: '',
            createdAt: ''
          });
        }
      }
    }

    // Check for overdue problems
    for (const problem of problems) {
      if (problem.dueDate && problem.status !== 'done') {
        const daysUntilDue = (new Date(problem.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysUntilDue < 0) {
          notifications.push({
            type: 'priority',
            title: 'Problem is overdue',
            message: `"${problem.text}" was due ${Math.abs(Math.floor(daysUntilDue))} days ago.`,
            relatedId: problem.id,
            priority: 'urgent',
            read: false,
            id: '',
            createdAt: ''
          });
        } else if (daysUntilDue < 1) {
          notifications.push({
            type: 'priority',
            title: 'Problem due today',
            message: `"${problem.text}" is due today.`,
            relatedId: problem.id,
            priority: 'high',
            read: false,
            id: '',
            createdAt: ''
          });
        }
      }
    }

    return notifications;
  }

  /**
   * Generate context-aware suggestions
   */
  async generateContextSuggestions(currentContext?: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // For v1, just suggest what to work on next based on priority
    const problems = getAllProblems();
    const inProgress = problems.filter(p => p.status === 'in_progress');
    const todo = problems.filter(p => p.status === 'todo');

    if (inProgress.length === 0 && todo.length > 0) {
      // Suggest starting a todo item
      const highPriority = todo.filter(p => p.priority === 'high' || p.priority === 'urgent');
      if (highPriority.length > 0) {
        const problem = highPriority[0];
        notifications.push({
          type: 'context',
          title: 'Suggested next task',
          message: `Consider working on "${problem.text}" (${problem.priority} priority)`,
          relatedId: problem.id,
          priority: 'medium',
          read: false,
          id: '',
          createdAt: ''
        });
      }
    }

    return notifications;
  }
}

export const aiAgent = new AIAgent();
