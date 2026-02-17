import { NextResponse } from 'next/server';
import { getSession, getValidationResult } from '@/lib/server/agent-manager';
import { buildSessionCheckpoints } from '@/lib/server/checkpoint-recorder';

export async function POST(request: Request) {
  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const validation = getValidationResult(sessionId);
  const checkpoints = buildSessionCheckpoints(session, validation ?? undefined);

  return NextResponse.json(checkpoints);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId query param required' }, { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const validation = getValidationResult(sessionId);
  const checkpoints = buildSessionCheckpoints(session, validation ?? undefined);

  return NextResponse.json(checkpoints);
}
