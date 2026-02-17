import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readStorage } from '@/lib/server/storage';

function getAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('No AI API key configured');
  let baseURL = process.env.OPENAI_BASE_URL;
  if (process.env.DEEPSEEK_API_KEY && !baseURL) baseURL = 'https://api.deepseek.com';
  return new OpenAI({ apiKey, baseURL });
}

function cleanJson(text: string): string {
  const m = text.match(/```json\s*([\s\S]*?)\s*```/);
  return m ? m[1].trim() : text.trim();
}

export async function POST(request: Request) {
  const { taskTitle, taskDescription, taskTags } = await request.json();

  if (!taskTitle) {
    return NextResponse.json({ error: 'taskTitle is required' }, { status: 400 });
  }

  try {
    const storage = await readStorage();
    const activePrinciples = storage.principles.filter((p) => p.isActive);

    if (activePrinciples.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const client = getAIClient();
    const model = process.env.OPENAI_MODEL || (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

    const principleList = activePrinciples.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      howToApply: p.howToApply,
      triggers: p.triggers,
      confidence: p.confidence,
      applications: p.applications.length,
    }));

    const response = await client.chat.completions.create({
      model,
      messages: [{
        role: 'user',
        content: `You are matching task requirements to available skills/principles that an AI coding agent can use.

Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ''}
${taskTags?.length ? `Tags: ${taskTags.join(', ')}` : ''}

Available skills/principles:
${JSON.stringify(principleList, null, 2)}

Return JSON array of matching principles, ranked by relevance:
[
  {
    "principleId": "id",
    "confidence": 0.85,
    "reason": "Why this skill is relevant to the task",
    "howToApplyHere": "Specific instructions for applying this skill to this task"
  }
]

Rules:
- Only include principles with confidence > 0.3
- Max 5 suggestions
- "howToApplyHere" should be concrete, actionable instructions an AI agent can follow
- Return empty array if no principles match`,
      }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const suggestions = JSON.parse(cleanJson(content));

    // Enrich with full principle data
    const enriched = (Array.isArray(suggestions) ? suggestions : [])
      .filter((s: { principleId?: string }) => s.principleId)
      .map((s: { principleId: string; confidence?: number; reason?: string; howToApplyHere?: string }) => {
        const principle = activePrinciples.find((p) => p.id === s.principleId);
        return principle ? { ...s, principleName: principle.name, principleDescription: principle.description } : null;
      })
      .filter(Boolean);

    return NextResponse.json({ suggestions: enriched });
  } catch (error) {
    console.error('Principle suggestion failed:', error);
    return NextResponse.json({ error: 'Failed to suggest principles' }, { status: 500 });
  }
}
