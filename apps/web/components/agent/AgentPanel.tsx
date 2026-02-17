'use client';

import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { AgentTerminal } from './AgentTerminal';
import { AgentStatusBadge } from './AgentStatusBadge';
import { ValidationReport } from './ValidationReport';
import { CheckpointTimeline } from '../checkpoints/CheckpointTimeline';
import { useAgentSession } from '@/hooks/useAgentSession';
import type { AgentType, AgentSessionStatus } from '@/lib/types';

interface AgentPanelProps {
  taskId: string;
  taskTitle: string;
}

export function AgentPanel({ taskId, taskTitle }: AgentPanelProps) {
  const [agentType, setAgentType] = useState<AgentType>('claude-code');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<AgentSessionStatus | null>(null);
  const [prompt, setPrompt] = useState(taskTitle);
  const [useWorktree, setUseWorktree] = useState(true);

  const { messages, session, connected, cancel } = useAgentSession(sessionId);

  // Track session completion from SSE messages
  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.type === 'system' && last.content.startsWith('Agent exited')) {
      const code = parseInt(last.content.match(/code (\d+)/)?.[1] || '-1');
      setStatus(code === 0 ? 'completed' : 'failed');
    }
  }, [messages]);

  const handleStart = async () => {
    if (!prompt.trim()) return;

    try {
      const res = await fetch('/api/agent/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, agentType, prompt: prompt.trim(), useWorktree }),
      });
      const s = await res.json();
      setSessionId(s.id);
      setStatus(s.status);
    } catch (err) {
      console.error('Failed to start agent:', err);
    }
  };

  const handleCancel = async () => {
    await cancel();
    setStatus('cancelled');
  };

  const isFinished = status === 'completed' || status === 'failed';

  return (
    <div className="space-y-4">
      {/* Agent type selector */}
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          Agent Executor
        </p>

        <div className="mb-3 flex gap-2">
          {(['claude-code', 'opencode', 'codex'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAgentType(type)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                agentType === type
                  ? 'bg-[#d26a3b] text-white'
                  : 'border border-[#dbc9ad] text-[#6c5d47] hover:bg-[#f7ead5]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Worktree toggle */}
        <label className="mb-3 flex items-center gap-2 text-xs text-[#6c5d47]">
          <input
            type="checkbox"
            checked={useWorktree}
            onChange={(e) => setUseWorktree(e.target.checked)}
            className="rounded border-[#dbc9ad]"
          />
          <span className="font-medium">Isolate in git worktree</span>
        </label>

        {/* Prompt input */}
        {!sessionId && (
          <div className="mb-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what the agent should do..."
              rows={3}
              className="w-full resize-none rounded-lg border border-[#dbc9ad] bg-[#faf6ef] p-2.5 text-xs text-[#2f271c] placeholder-[#8e7e67] focus:border-[#d26a3b] focus:outline-none"
            />
          </div>
        )}

        {/* Start / Cancel buttons */}
        {!sessionId && (
          <button
            onClick={handleStart}
            disabled={!prompt.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d26a3b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Start Agent
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={handleCancel}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            <Square className="h-3.5 w-3.5" />
            Cancel Agent
          </button>
        )}

        {status && <div className="mt-2"><AgentStatusBadge status={status} /></div>}
      </div>

      {/* Terminal output */}
      {sessionId && (
        <AgentTerminal messages={messages} connected={connected} />
      )}

      {/* Validation + Merge (after agent finishes) */}
      {sessionId && isFinished && useWorktree && (
        <ValidationReport sessionId={sessionId} />
      )}

      {/* Checkpoint timeline */}
      {sessionId && isFinished && (
        <CheckpointTimeline sessionId={sessionId} />
      )}
    </div>
  );
}
