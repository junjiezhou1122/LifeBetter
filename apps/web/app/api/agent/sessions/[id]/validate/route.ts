import { NextResponse } from 'next/server';
import { validateSession, getSession } from '@/lib/server/agent-manager';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.status === 'running' || session.status === 'pending') {
    return NextResponse.json({ error: 'Session still running' }, { status: 400 });
  }

  const result = await validateSession(id);

  if (!result) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }

  return NextResponse.json(result);
}
