import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { readStorage } from '@/lib/server/storage';

interface AutoSolveAction {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  canAutoSolve: boolean;
  autoSolveResult?: string;
  confidence?: number;
}

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

function normalizeActions(raw: unknown): AutoSolveAction[] {
  if (!Array.isArray(raw)) return [];

  return raw.reduce<AutoSolveAction[]>((acc, item) => {
      const maybe = item as Partial<AutoSolveAction>;
      if (!maybe?.title || typeof maybe.title !== 'string') return acc;

      const priority = ['low', 'medium', 'high', 'urgent'].includes(
        maybe.priority || '',
      )
        ? (maybe.priority as AutoSolveAction['priority'])
        : 'medium';

      acc.push({
        title: maybe.title.trim(),
        description:
          typeof maybe.description === 'string' ? maybe.description.trim() : '',
        priority,
        canAutoSolve: Boolean(maybe.canAutoSolve),
        autoSolveResult:
          typeof maybe.autoSolveResult === 'string'
            ? maybe.autoSolveResult.trim()
            : '',
        confidence:
          typeof maybe.confidence === 'number'
            ? Math.max(0, Math.min(1, maybe.confidence))
            : undefined,
      });

      return acc;
    }, []);
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

    const taskHints = Array.isArray(breakdownTasks)
      ? breakdownTasks
          .slice(0, 10)
          .map((task, index) => `${index + 1}. ${String(task?.title || '')}`)
          .join('\n')
      : '';

    const client = getAIClient();
    const model =
      process.env.OPENAI_MODEL ||
      (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

    const prompt = `You are helping classify and pre-solve project work.
Item: ${title}
Depth: ${item.depth}

Existing breakdown tasks (optional):
${taskHints || 'None'}

Return JSON array only, with 3-8 actions:
[
  {
    "title": "Action title",
    "description": "What this action does",
    "priority": "low|medium|high|urgent",
    "canAutoSolve": true,
    "autoSolveResult": "Concrete output AI can directly produce now",
    "confidence": 0.82
  }
]

Rules:
- canAutoSolve=true only for text/planning/research-like outputs AI can finish now.
- canAutoSolve=false for actions needing external execution or human decision.
- Keep actions specific and outcome-oriented.
- confidence must be between 0 and 1.`;

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const cleanedContent = cleanJsonResponse(content);
    const parsed = JSON.parse(cleanedContent);
    const actions = normalizeActions(parsed);

    return NextResponse.json({ actions });
  } catch (error) {
    console.error('AI auto-solve generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate auto-solve actions' },
      { status: 500 },
    );
  }
}
