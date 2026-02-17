import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readStorage, writeStorage } from '@/lib/server/storage';
import type { Principle } from '@/lib/types';

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

function generateId() {
  return `principle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request) {
  const { experienceIds } = await request.json();

  try {
    const storage = await readStorage();

    // Get experiences to analyze
    const experiences = experienceIds?.length
      ? storage.experiences.filter((e) => experienceIds.includes(e.id))
      : storage.experiences.slice(-20); // Last 20 experiences

    if (experiences.length === 0) {
      return NextResponse.json({ extracted: [], refined: [] });
    }

    const existingPrinciples = storage.principles.filter((p) => p.isActive);

    const client = getAIClient();
    const model = process.env.OPENAI_MODEL || (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

    const response = await client.chat.completions.create({
      model,
      messages: [{
        role: 'user',
        content: `You are analyzing task experiences to discover reusable skills/principles that AI coding agents (like Claude Code) can follow.

Experiences:
${JSON.stringify(experiences.map((e) => ({
  task: e.task,
  approach: e.approach,
  outcome: e.outcome,
  retrospective: e.retrospective,
  context: e.context,
})), null, 2)}

Existing principles/skills:
${JSON.stringify(existingPrinciples.map((p) => ({
  id: p.id,
  name: p.name,
  howToApply: p.howToApply,
  confidence: p.confidence,
})), null, 2)}

Analyze the experiences and return JSON:
{
  "newPrinciples": [
    {
      "name": "Short skill name",
      "description": "What this skill is about",
      "howToApply": "Step-by-step instructions an AI agent should follow when this skill applies. Be specific and actionable.",
      "triggers": {
        "taskTypes": ["type1"],
        "complexityRange": ["medium", "high"],
        "domains": ["domain1"],
        "keywords": ["keyword1"]
      },
      "confidence": 0.6,
      "derivedFromExperiences": ["exp-id-1"]
    }
  ],
  "refinements": [
    {
      "principleId": "existing-id",
      "updatedHowToApply": "Improved instructions based on new experience",
      "confidenceAdjustment": 0.1,
      "reason": "Why this refinement"
    }
  ]
}

Rules:
- "howToApply" must be concrete instructions suitable for an AI coding agent's system prompt
- Don't duplicate existing principles - refine them instead
- Only extract principles that appear in 2+ experiences or are high-confidence from 1 strong experience
- confidence: 0-1, higher = more validated
- Return empty arrays if no clear patterns found`,
      }],
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(cleanJson(content));
    const now = new Date().toISOString();

    // Create new principles
    const newPrinciples: Principle[] = (result.newPrinciples || []).map(
      (np: { name: string; description: string; howToApply: string; triggers?: Principle['triggers']; confidence?: number; derivedFromExperiences?: string[] }) => ({
        id: generateId(),
        name: np.name,
        description: np.description,
        version: 1,
        confidence: np.confidence ?? 0.5,
        triggers: np.triggers || { taskTypes: [], complexityRange: [], domains: [], keywords: [] },
        howToApply: np.howToApply,
        relations: { complementary: [], prerequisite: [], conflicting: [] },
        derivedFrom: {
          experienceIds: np.derivedFromExperiences || [],
          discoveredAt: now,
          lastRefinedAt: now,
        },
        applications: [],
        source: 'discovered' as const,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
    );

    // Apply refinements
    const refinements = result.refinements || [];
    for (const ref of refinements) {
      const idx = storage.principles.findIndex((p) => p.id === ref.principleId);
      if (idx !== -1) {
        const p = storage.principles[idx];
        if (ref.updatedHowToApply) {
          p.howToApply = ref.updatedHowToApply;
          p.version += 1;
        }
        if (typeof ref.confidenceAdjustment === 'number') {
          p.confidence = Math.max(0, Math.min(1, p.confidence + ref.confidenceAdjustment));
        }
        p.derivedFrom.lastRefinedAt = now;
        p.updatedAt = now;
      }
    }

    // Save new principles
    storage.principles.push(...newPrinciples);
    await writeStorage(storage);

    return NextResponse.json({
      extracted: newPrinciples,
      refined: refinements,
    });
  } catch (error) {
    console.error('Principle extraction failed:', error);
    return NextResponse.json({ error: 'Failed to extract principles' }, { status: 500 });
  }
}
