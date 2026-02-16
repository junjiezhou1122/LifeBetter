import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { readStorage } from '@/lib/server/storage';

interface TaskInput {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lineage?: string[];
}

interface AutoSolveAction {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  canAutoSolve: boolean;
  autoSolveResult?: string;
  confidence?: number;
  nextStepType?: 'breakdown' | 'manual-first-principle';
  suggestedBreakdown?: string[];
  humanAdvice?: string;
  lineage?: string[];
  iteration?: number;
}

interface AnalyzeResult {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  canAutoSolve: boolean;
  autoSolveResult?: string;
  confidence?: number;
  reason?: string;
  atFirstPrinciple?: boolean;
  humanAdvice?: string;
}

interface BreakdownResult {
  parentTitle: string;
  subtasks: Array<{
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }>;
}

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const MAX_ITERATIONS = 3;
const MAX_TASKS_PER_ROUND = 6;

function getAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      'No AI API key configured. Please set OPENAI_API_KEY or DEEPSEEK_API_KEY in .env.local',
    );
  }

  let baseURL = process.env.OPENAI_BASE_URL;
  if (process.env.DEEPSEEK_API_KEY && !baseURL) {
    baseURL = 'https://api.deepseek.com';
  }

  return new OpenAI({ apiKey, baseURL });
}

function cleanJsonResponse(text: string): string {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) return jsonMatch[1].trim();
  return text.trim();
}

function toPriority(value: unknown): 'low' | 'medium' | 'high' | 'urgent' {
  if (typeof value === 'string' && PRIORITIES.includes(value as (typeof PRIORITIES)[number])) {
    return value as 'low' | 'medium' | 'high' | 'urgent';
  }
  return 'medium';
}

function normalizeTaskInput(raw: unknown): TaskInput[] {
  if (!Array.isArray(raw)) return [];

  return raw.reduce<TaskInput[]>((acc, task) => {
    const maybe = task as Partial<TaskInput>;
    if (!maybe?.title || typeof maybe.title !== 'string') return acc;

    acc.push({
      title: maybe.title.trim(),
      description: typeof maybe.description === 'string' ? maybe.description.trim() : '',
      priority: toPriority(maybe.priority),
      lineage: [maybe.title.trim()],
    });

    return acc;
  }, []);
}

function normalizeAnalyzeResults(raw: unknown): AnalyzeResult[] {
  if (!Array.isArray(raw)) return [];

  return raw.reduce<AnalyzeResult[]>((acc, item) => {
    const maybe = item as Partial<AnalyzeResult>;
    if (!maybe?.title || typeof maybe.title !== 'string') return acc;

    acc.push({
      title: maybe.title.trim(),
      description: typeof maybe.description === 'string' ? maybe.description.trim() : '',
      priority: toPriority(maybe.priority),
      canAutoSolve: Boolean(maybe.canAutoSolve),
      autoSolveResult:
        typeof maybe.autoSolveResult === 'string'
          ? maybe.autoSolveResult.trim()
          : '',
      confidence:
        typeof maybe.confidence === 'number'
          ? Math.max(0, Math.min(1, maybe.confidence))
          : undefined,
      reason: typeof maybe.reason === 'string' ? maybe.reason.trim() : '',
      atFirstPrinciple: Boolean(maybe.atFirstPrinciple),
      humanAdvice:
        typeof maybe.humanAdvice === 'string' ? maybe.humanAdvice.trim() : '',
    });

    return acc;
  }, []);
}

function normalizeBreakdownResults(raw: unknown): BreakdownResult[] {
  if (!Array.isArray(raw)) return [];

  return raw.reduce<BreakdownResult[]>((acc, item) => {
    const maybe = item as Partial<BreakdownResult>;
    if (!maybe?.parentTitle || typeof maybe.parentTitle !== 'string') return acc;

    const subtasks = Array.isArray(maybe.subtasks)
      ? maybe.subtasks
          .map((sub) => {
            if (!sub || typeof sub !== 'object') return null;
            const candidate = sub as {
              title?: string;
              description?: string;
              priority?: string;
            };
            if (!candidate.title || typeof candidate.title !== 'string') return null;

            return {
              title: candidate.title.trim(),
              description:
                typeof candidate.description === 'string'
                  ? candidate.description.trim()
                  : '',
              priority: toPriority(candidate.priority),
            };
          })
          .filter(Boolean) as BreakdownResult['subtasks']
      : [];

    acc.push({
      parentTitle: maybe.parentTitle.trim(),
      subtasks,
    });

    return acc;
  }, []);
}

async function analyzeRound(
  client: OpenAI,
  model: string,
  itemTitle: string,
  itemDepth: number,
  tasks: TaskInput[],
  iteration: number,
): Promise<AnalyzeResult[]> {
  const prompt = `You are an AI project solver.

Parent item: ${itemTitle}
Parent depth: ${itemDepth}
Iteration: ${iteration + 1}

Tasks to evaluate:
${tasks
  .map(
    (task, index) =>
      `${index + 1}. ${task.title}${task.description ? ` - ${task.description}` : ''}`,
  )
  .join('\n')}

Return JSON array only with the same number of tasks:
[
  {
    "title": "Task title (same as input)",
    "description": "Refined task meaning",
    "priority": "low|medium|high|urgent",
    "canAutoSolve": true,
    "autoSolveResult": "Concrete output AI can directly provide now",
    "confidence": 0.85,
    "reason": "Why it can/cannot be solved now",
    "atFirstPrinciple": false,
    "humanAdvice": "What a human should do next if AI cannot complete it"
  }
]

Rules:
- canAutoSolve=true only if AI can complete the deliverable fully in text.
- canAutoSolve=false for tasks needing physical execution, decisions, measurements, or external validation.
- atFirstPrinciple=true when task is atomic/manual and should not be broken down further.
- When canAutoSolve=false, always provide humanAdvice with concrete next actions.
- confidence must be between 0 and 1.`;

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '[]';
  const cleaned = cleanJsonResponse(content);
  return normalizeAnalyzeResults(JSON.parse(cleaned));
}

async function breakdownRound(
  client: OpenAI,
  model: string,
  itemTitle: string,
  itemDepth: number,
  tasks: AnalyzeResult[],
  iteration: number,
): Promise<BreakdownResult[]> {
  const prompt = `You are decomposing unresolved tasks into smaller first-principle actions.

Parent item: ${itemTitle}
Parent depth: ${itemDepth}
Current iteration: ${iteration + 1}

Unresolved tasks:
${tasks
  .map(
    (task, index) =>
      `${index + 1}. ${task.title}${task.reason ? ` (reason: ${task.reason})` : ''}`,
  )
  .join('\n')}

Return JSON array only:
[
  {
    "parentTitle": "Original unresolved task title",
    "subtasks": [
      {
        "title": "Smaller task",
        "description": "Clear and concrete",
        "priority": "low|medium|high|urgent"
      }
    ]
  }
]

Rules:
- Create 2-4 subtasks for each unresolved task when possible.
- Make subtasks concrete and independently actionable.
- If already first-principle/manual, return empty subtasks for that parent.
- Do not invent unsupported outputs.`;

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content || '[]';
  const cleaned = cleanJsonResponse(content);
  return normalizeBreakdownResults(JSON.parse(cleaned));
}

function toAction(
  result: AnalyzeResult,
  source: TaskInput,
  iteration: number,
  breakdown?: string[],
): AutoSolveAction {
  const reasonLine = result.reason ? `Reason: ${result.reason}` : '';
  const description = [result.description || source.description || '', reasonLine]
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return {
    title: result.title || source.title,
    description,
    priority: result.priority || source.priority,
    canAutoSolve: result.canAutoSolve,
    autoSolveResult: result.autoSolveResult || '',
    confidence: result.confidence,
    nextStepType: result.canAutoSolve
      ? undefined
      : result.atFirstPrinciple
        ? 'manual-first-principle'
        : 'breakdown',
    suggestedBreakdown: breakdown,
    humanAdvice:
      result.humanAdvice ||
      (result.atFirstPrinciple
        ? 'Handle this step manually and document outcome in Notes.'
        : 'Break this step down further, then retry AI solve on the smaller steps.'),
    lineage: source.lineage,
    iteration: iteration + 1,
  };
}

export async function POST(request: Request) {
  const { itemId, title, breakdownTasks = [] } = await request.json();

  if (!itemId || !title) {
    return NextResponse.json(
      { error: 'itemId and title are required' },
      { status: 400 },
    );
  }

  try {
    const storage = await readStorage();
    const item = storage.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const client = getAIClient();
    const model =
      process.env.OPENAI_MODEL ||
      (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

    let queue: TaskInput[] = normalizeTaskInput(breakdownTasks)
      .slice(0, MAX_TASKS_PER_ROUND)
      .filter((task) => task.title.length > 0);

    if (queue.length === 0) {
      queue = [
        {
          title: title.trim(),
          description: '',
          priority: 'medium',
          lineage: [title.trim()],
        },
      ];
    }

    const actions: AutoSolveAction[] = [];
    let iteration = 0;

    while (iteration < MAX_ITERATIONS && queue.length > 0) {
      const roundTasks = queue.slice(0, MAX_TASKS_PER_ROUND);

      const analyzed = await analyzeRound(
        client,
        model,
        title,
        item.depth,
        roundTasks,
        iteration,
      );

      const analysisByTitle = new Map(
        analyzed.map((entry) => [entry.title.toLowerCase(), entry]),
      );

      const unresolved: Array<{ result: AnalyzeResult; source: TaskInput }> = [];

      for (const task of roundTasks) {
        const result = analysisByTitle.get(task.title.toLowerCase()) || {
          title: task.title,
          description: task.description,
          priority: task.priority,
          canAutoSolve: false,
          reason: 'Needs decomposition before execution.',
          atFirstPrinciple: false,
        };

        if (result.canAutoSolve || result.atFirstPrinciple || iteration === MAX_ITERATIONS - 1) {
          actions.push(toAction(result, task, iteration));
          continue;
        }

        unresolved.push({ result, source: task });
      }

      if (unresolved.length === 0) {
        break;
      }

      const brokenDown = await breakdownRound(
        client,
        model,
        title,
        item.depth,
        unresolved.map((entry) => entry.result),
        iteration,
      );

      const breakdownByParent = new Map(
        brokenDown.map((entry) => [entry.parentTitle.toLowerCase(), entry.subtasks]),
      );

      const nextQueue: TaskInput[] = [];

      for (const { result, source } of unresolved) {
        const children = breakdownByParent.get(result.title.toLowerCase()) || [];
        if (children.length === 0) {
          actions.push(
            toAction(
              {
                ...result,
                canAutoSolve: false,
                atFirstPrinciple: true,
              },
              source,
              iteration,
            ),
          );
          continue;
        }

        actions.push(
          toAction(result, source, iteration, children.map((child) => child.title)),
        );

        for (const child of children.slice(0, MAX_TASKS_PER_ROUND)) {
          nextQueue.push({
            title: child.title,
            description: child.description,
            priority: child.priority || source.priority,
            lineage: [...(source.lineage || [source.title]), child.title],
          });
        }
      }

      queue = nextQueue.slice(0, MAX_TASKS_PER_ROUND);
      iteration += 1;
    }

    const dedupedActions = actions.filter((action, index, arr) => {
      const key = `${action.title.toLowerCase()}::${action.iteration || 0}`;
      return arr.findIndex((candidate) => `${candidate.title.toLowerCase()}::${candidate.iteration || 0}` === key) === index;
    });

    const summary = {
      autoSolvable: dedupedActions.filter((item) => item.canAutoSolve).length,
      requiresBreakdown: dedupedActions.filter((item) => item.nextStepType === 'breakdown').length,
      firstPrincipleManual: dedupedActions.filter(
        (item) => item.nextStepType === 'manual-first-principle',
      ).length,
      iterationsUsed: Math.min(MAX_ITERATIONS, Math.max(1, iteration + 1)),
    };

    return NextResponse.json({ actions: dedupedActions, summary });
  } catch (error) {
    console.error('AI auto-solve generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate auto-solve actions' },
      { status: 500 },
    );
  }
}
