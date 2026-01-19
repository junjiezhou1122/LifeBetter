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
    if (!storage.tasks) storage.tasks = [];
    if (!storage.notifications) storage.notifications = [];
    return storage;
  } catch {
    return { problems: [], tasks: [], notifications: [] };
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

  const baseURL = process.env.DEEPSEEK_API_KEY
    ? 'https://api.deepseek.com'
    : undefined;

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
  const { type, id, text, title } = await request.json();

  try {
    const client = getAIClient();
    const model = process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini';

    let prompt = '';
    if (type === 'problem') {
      prompt = `Break down this problem into 3-7 actionable tasks. Each task should be:
- Specific and measurable
- Achievable in 1-4 hours
- Independent when possible

Problem: ${text}

Return a JSON array of tasks with this structure:
[
  {
    "title": "Task title",
    "description": "Detailed description",
    "priority": "low|medium|high|urgent",
    "estimatedHours": 1.5
  }
]`;
    } else {
      prompt = `Break down this task into 2-5 smaller subtasks. Each subtask should be:
- Specific and actionable
- Achievable in 0.5-2 hours
- A clear step toward completing the parent task

Task: ${title}

Return a JSON array of subtasks with this structure:
[
  {
    "title": "Subtask title",
    "description": "Detailed description",
    "priority": "low|medium|high|urgent",
    "estimatedHours": 0.5
  }
]`;
    }

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const cleanedContent = cleanJsonResponse(content);
    const suggestedTasks = JSON.parse(cleanedContent);

    // Create the tasks in storage
    const storage = readStorage();
    const newTasks = suggestedTasks.map((task: any) => ({
      id: crypto.randomUUID(),
      problemId: type === 'problem' ? id : storage.tasks.find((t: any) => t.id === id)?.problemId,
      parentTaskId: type === 'task' ? id : null,
      title: task.title,
      description: task.description || '',
      status: 'todo',
      priority: task.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blockedBy: [],
      blocking: [],
      canBreakdown: true
    }));

    storage.tasks.push(...newTasks);

    // Update breakdown status
    if (type === 'problem') {
      const problemIndex = storage.problems.findIndex((p: any) => p.id === id);
      if (problemIndex !== -1) {
        storage.problems[problemIndex].breakdownStatus = 'completed';
        storage.problems[problemIndex].updatedAt = new Date().toISOString();
      }
    }

    writeStorage(storage);

    return NextResponse.json({ tasks: newTasks });
  } catch (error) {
    console.error('AI breakdown failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate breakdown' },
      { status: 500 }
    );
  }
}
