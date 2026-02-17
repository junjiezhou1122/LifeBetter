'use client';

import { useState, useEffect } from 'react';
import { Play, Square, Zap, RefreshCw } from 'lucide-react';
import { AgentTerminal } from './AgentTerminal';
import { AgentStatusBadge } from './AgentStatusBadge';
import { ValidationReport } from './ValidationReport';
import { CheckpointTimeline } from '../checkpoints/CheckpointTimeline';
import { useAgentSession } from '@/hooks/useAgentSession';
import type { AgentType, TaskSpec, AgentSessionStatus } from '@/lib/types';

interface AgentPanelProps {
  taskId: string;
  taskTitle: string;
}

export function AgentPanel({ taskId, taskTitle }: AgentPanelProps) {
  const [agentType, setAgentType] = useState<AgentType>('claude-code');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<AgentSessionStatus | null>(null);
  const [generating, setGenerating] = useState(false);
  const [spec, setSpec] = useState<TaskSpec | null>(null);
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

  const handleGenerateSpec = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/spec/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: taskId }),
      });
      const data = await res.json();
      if (data.spec) setSpec(data.spec);
    } catch (err) {
      console.error('Failed to generate spec:', err);
    }
    setGenerating(false);
  };

  const handleStart = async () => {
    if (!spec) return;

    try {
      const res = await fetch('/api/agent/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, agentType, spec, useWorktree }),
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

        {/* Generate spec */}
        {!spec && (
          <button
            onClick={handleGenerateSpec}
            disabled={generating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f7ead5] px-4 py-2 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f2e1c7] disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            {generating ? 'Generating Spec...' : 'Generate Task Spec'}
          </button>
        )}

        {/* Show spec */}
        {spec && (
          <div className="mb-3 space-y-2">
            <div className="rounded-lg border border-[#e8dcc9] bg-[#faf6ef] p-2.5">
              <p className="mb-1 text-[11px] font-semibold text-[#6c5d47]">Objective</p>
              <p className="text-xs text-[#2f271c]">{spec.objective}</p>
            </div>

            {spec.requirements.length > 0 && (
              <div className="rounded-lg border border-[#e8dcc9] bg-[#faf6ef] p-2.5">
                <p className="mb-1 text-[11px] font-semibold text-[#6c5d47]">Requirements</p>
                <ul className="list-inside list-disc text-xs text-[#5d4b34]">
                  {spec.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {spec.principleInstructions.length > 0 && (
              <div className="rounded-lg border border-[#e8dcc9] bg-[#faf6ef] p-2.5">
                <p className="mb-1 text-[11px] font-semibold text-[#6c5d47]">Skills Applied</p>
                <ul className="list-inside list-disc text-xs text-[#5d4b34]">
                  {spec.principleInstructions.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleGenerateSpec}
                disabled={generating}
                className="flex items-center gap-1.5 rounded-lg border border-[#dbc9ad] px-3 py-1.5 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f7ead5]"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Start / Cancel buttons */}
        {spec && !sessionId && (
          <button
            onClick={handleStart}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d26a3b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#bb5a2f]"
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
