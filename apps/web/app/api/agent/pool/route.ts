import { NextResponse } from 'next/server';
import { getPoolConfig, setPoolConfig } from '@/lib/server/task-queue';
import { listSessions } from '@/lib/server/agent-manager';

export async function GET() {
  const config = getPoolConfig();
  const sessions = listSessions();
  const active = sessions.filter((s) => s.status === 'running').length;

  return NextResponse.json({
    ...config,
    activeAgents: active,
    totalSessions: sessions.length,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  setPoolConfig(body);
  return NextResponse.json(getPoolConfig());
}
