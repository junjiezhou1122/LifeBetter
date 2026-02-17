import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readStorage } from '@/lib/server/storage';
import type { TaskSpec } from '@/lib/types';

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
  const { itemId } = await request.json();

  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  try {
    const storage = await readStorage();
    const item = storage.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get linked principles
    const linkedPrinciples = (item.principleIds || [])
      .map((pid) => storage.principles.find((p) => p.id === pid))
      .filter(Boolean);

    const client = getAIClient();
    const model = process.env.OPENAI_MODEL || (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

    const response = await client.chat.completions.create({
      model,
      messages: [{
        role: 'user',
        content: `Generate a TaskSpec for an AI coding agent to execute. This will be given to Claude Code or similar agents.

Task: ${item.title}
${item.description ? `Description: ${item.description}` : ''}
${item.notes ? `Notes: ${item.notes}` : ''}
${item.tags?.length ? `Tags: ${item.tags.join(', ')}` : ''}

${linkedPrinciples.length > 0 ? `Available Skills/Principles to apply:\n${linkedPrinciples.map((p) => `- ${p!.name}: ${p!.howToApply}`).join('\n')}` : ''}

Return JSON:
{
  "objective": "Clear single-sentence objective",
  "requirements": ["Specific requirement 1", "..."],
  "constraints": ["Constraint 1", "..."],
  "acceptanceCriteria": ["Criterion 1", "..."],
  "principleInstructions": ["Instruction from principle 1", "..."],
  "context": "Additional context about the project or codebase"
}

Rules:
- objective should be action-oriented and specific
- requirements should be concrete and verifiable
- principleInstructions should be direct instructions the agent can follow
- Keep it concise but complete`,
      }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const spec: TaskSpec = JSON.parse(cleanJson(content));

    // Ensure all fields exist
    spec.objective = spec.objective || item.title;
    spec.requirements = spec.requirements || [];
    spec.constraints = spec.constraints || [];
    spec.acceptanceCriteria = spec.acceptanceCriteria || [];
    spec.principleInstructions = spec.principleInstructions || [];

    return NextResponse.json({ spec });
  } catch (error) {
    console.error('Spec generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate spec' }, { status: 500 });
  }
}
