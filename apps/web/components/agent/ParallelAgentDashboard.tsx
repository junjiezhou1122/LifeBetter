'use client';

import { useState, useEffect, useCallback } from 'react';
import { Monitor, RefreshCw } from 'lucide-react';
import { AgentTerminal } from './AgentTerminal';
import { AgentStatusBadge } from './AgentStatusBadge';
import { AgentQueuePanel } from './AgentQueuePanel';
import type { AgentSession, AgentMessage } from '@/lib/types';

export function ParallelAgentDashboard() {
  const [sessions, setSessions] = useState<AgentSession[]>([]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/sessions');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const activeSessions = sessions.filter((s) => s.status === 'running');
  const recentSessions = sessions
    .filter((s) => s.status !== 'running')
    .slice(0, 5);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden px-3 pb-4 pt-3 md:px-4 md:pb-5 md:pt-3.5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-[#d26a3b]" />
          <h2 className="text-lg font-bold text-[#2f271c]">Agent Dashboard</h2>
        </div>
        <button onClick={fetchSessions} className="text-[#6c5d47] hover:text-[#2f271c]">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Queue panel */}
        <div className="mb-4">
          <AgentQueuePanel />
        </div>

        {/* Active agents grid */}
        {activeSessions.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
              Active Agents ({activeSessions.length})
            </p>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {activeSessions.map((session) => (
                <ActiveAgentCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
              Recent Sessions
            </p>
            <div className="space-y-1.5">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-2 rounded-lg border border-[#e8dcc9] bg-[#faf6ef] p-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-[#2f271c]">
                      {session.prompt?.slice(0, 60) || session.taskId}
                    </p>
                    <p className="text-[10px] text-[#7a6b57]">
                      {session.agentType} | {session.worktreeBranch || 'no worktree'}
                    </p>
                  </div>
                  <AgentStatusBadge status={session.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSessions.length === 0 && recentSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Monitor className="mb-3 h-10 w-10 text-[#dbc9ad]" />
            <p className="text-sm font-medium text-[#6c5d47]">No agent sessions</p>
            <p className="text-xs text-[#8e7e67]">Queue tasks or start an agent from the item detail sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveAgentCard({ session }: { session: AgentSession }) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/agent/sessions/${session.id}/stream`);
    es.onopen = () => setConnected(true);
    es.onmessage = (event) => {
      try {
        const msg: AgentMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch { /* ignore */ }
    };
    es.onerror = () => {
      setConnected(false);
      es.close();
    };
    return () => es.close();
  }, [session.id]);

  return (
    <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-2 shadow-[0_4px_12px_rgba(95,67,31,0.08)]">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="truncate text-xs font-semibold text-[#2f271c]">
          {session.prompt?.slice(0, 50) || session.taskId}
        </p>
        <AgentStatusBadge status={session.status} />
      </div>
      <p className="mb-1.5 text-[10px] text-[#7a6b57]">
        {session.agentType} | {session.worktreeBranch || 'main'}
      </p>
      <div className="h-32">
        <AgentTerminal messages={messages} connected={connected} />
      </div>
    </div>
  );
}
