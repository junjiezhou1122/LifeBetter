import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import OpenAI from 'openai';

function getStoragePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.lifebetter', 'problems.json');
}

function readStorage() {
  try {
    const data = fs.readFileSync(getStoragePath(), 'utf-8');
    const storage = JSON.parse(data);

    // Support new format (version 2)
    if (storage.version === 2 && storage.items) {
      // Ensure metaSkills array exists
      if (!storage.metaSkills) {
        storage.metaSkills = [];
      }
      return storage;
    }

    // Support old format for backward compatibility
    if (!storage.tasks) storage.tasks = [];
    if (!storage.notifications) storage.notifications = [];
    return storage;
  } catch {
    return { items: [], metaSkills: [], notifications: [], version: 2 };
  }
}

function writeStorage(storage: any) {
  fs.writeFileSync(getStoragePath(), JSON.stringify(storage, null, 2), 'utf-8');
}

function getAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('No AI API key configured. Please set OPENAI_API_KEY or DEEPSEEK_API_KEY in .env.local');
  }

  // Support custom base URL
  let baseURL = process.env.OPENAI_BASE_URL;

  // Default to DeepSeek if using DeepSeek key
  if (process.env.DEEPSEEK_API_KEY && !baseURL) {
    baseURL = 'https://api.deepseek.com';
  }

  return new OpenAI({ apiKey, baseURL });
}

function cleanJsonResponse(text: string): string {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  return text.trim();
}

export async function POST(request: Request) {
  const { itemId, title, metaSkillId } = await request.json();

  if (!itemId || !title) {
    return NextResponse.json(
      { error: 'itemId and title are required' },
      { status: 400 }
    );
  }

  try {
    // Read storage to get item depth and meta-skill
    const storage = readStorage();
    const item = storage.items?.find((i: any) => i.id === itemId);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Get meta-skill if provided
    let metaSkill = null;
    if (metaSkillId && storage.metaSkills) {
      metaSkill = storage.metaSkills.find((ms: any) => ms.id === metaSkillId);
    }

    const client = getAIClient();
    const model = process.env.OPENAI_MODEL ||
                  (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

    let prompt = '';

    // If meta-skill provided and has workflow, use it
    if (metaSkill && metaSkill.workflow) {
      if (metaSkill.workflow.type === 'ai-breakdown' && metaSkill.workflow.aiPrompt) {
        // Use custom meta-skill prompt
        prompt = `${metaSkill.workflow.aiPrompt}

Item to break down: ${title}

Return a JSON array of sub-items with this structure:
[
  {
    "title": "Sub-item title",
    "description": "Detailed description",
    "priority": "low|medium|high|urgent",
    "estimatedHours": 1.5
  }
]`;
      } else if (metaSkill.workflow.type === 'template' && metaSkill.workflow.template) {
        // Use predefined template
        const tasks = metaSkill.workflow.template.map((step: any) => ({
          title: step.title,
          description: step.description,
          priority: 'medium',
          estimatedHours: step.estimatedHours || 1
        }));

        // Update meta-skill usage
        metaSkill.timesApplied++;
        const msIndex = storage.metaSkills.findIndex((ms: any) => ms.id === metaSkillId);
        if (msIndex !== -1) {
          storage.metaSkills[msIndex] = metaSkill;
          writeStorage(storage);
        }

        return NextResponse.json({
          tasks,
          metaSkillApplied: metaSkillId,
          metaSkillName: metaSkill.name
        });
      }
    } else {
      // Default generic breakdown
      const isRootLevel = item.depth === 0;

      if (isRootLevel) {
        prompt = `Break down this item into 3-7 actionable sub-items. Each sub-item should be:
- Specific and measurable
- Achievable in 1-4 hours
- Independent when possible

Item: ${title}

Return a JSON array of sub-items with this structure:
[
  {
    "title": "Sub-item title",
    "description": "Detailed description",
    "priority": "low|medium|high|urgent",
    "estimatedHours": 1.5
  }
]`;
      } else {
        prompt = `Break down this item into 2-5 smaller sub-items. Each sub-item should be:
- Specific and actionable
- Achievable in 0.5-2 hours
- A clear step toward completing the parent item

Item: ${title}

Return a JSON array of sub-items with this structure:
[
  {
    "title": "Sub-item title",
    "description": "Detailed description",
    "priority": "low|medium|high|urgent",
    "estimatedHours": 0.5
  }
]`;
      }
    }

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const cleanedContent = cleanJsonResponse(content);
    const suggestedTasks = JSON.parse(cleanedContent);

    // Update meta-skill usage if applied
    if (metaSkill) {
      metaSkill.timesApplied++;
      const msIndex = storage.metaSkills.findIndex((ms: any) => ms.id === metaSkillId);
      if (msIndex !== -1) {
        storage.metaSkills[msIndex] = metaSkill;
        writeStorage(storage);
      }
    }

    // Return the suggested tasks without creating them
    return NextResponse.json({
      tasks: suggestedTasks,
      metaSkillApplied: metaSkillId,
      metaSkillName: metaSkill?.name
    });
  } catch (error) {
    console.error('AI breakdown failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate breakdown' },
      { status: 500 }
    );
  }
}
