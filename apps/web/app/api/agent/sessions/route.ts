import { NextResponse } from 'next/server';
import { listSessions, startSession, cancelSession, getSession } from '@/lib/server/agent-manager';
import type { AgentType } from '@/lib/types';

export async function GET() {
  return NextResponse.json(listSessions());
}

export async function POST(request: Request) {
  const { action, taskId, agentType, prompt, sessionId, cwd, useWorktree } = await request.json();

  if (action === 'cancel') {
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    const cancelled = cancelSession(sessionId);
    return NextResponse.json({ success: cancelled });
  }

  if (action === 'get') {
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  // Default: start a new session
  if (!taskId || !agentType || !prompt) {
    return NextResponse.json({ error: 'taskId, agentType, and prompt are required' }, { status: 400 });
  }

  const session = await startSession(
    taskId,
    agentType as AgentType,
    prompt,
    cwd,
    useWorktree ?? true,
  );

  return NextResponse.json(session, { status: 201 });
}
