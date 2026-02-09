'use client';

import { useState } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';

interface SuggestedTask {
  title: string;
  description?: string;
  priority: string;
  estimatedHours?: number;
}

interface AutoSolveAction {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  canAutoSolve: boolean;
  autoSolveResult?: string;
  confidence?: number;
}

interface AutoSolvePanelProps {
  itemId: string;
  title: string;
  suggestedTasks: SuggestedTask[];
  onCompleted: () => void;
}

export function AutoSolvePanel({
  itemId,
  title,
  suggestedTasks,
  onCompleted,
}: AutoSolvePanelProps) {
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [actions, setActions] = useState<AutoSolveAction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const fetchActions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auto-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, title, breakdownTasks: suggestedTasks }),
      });

      if (!res.ok) throw new Error('Failed to analyze auto-solve');

      const data = await res.json();
      const nextActions = (data.actions || []) as AutoSolveAction[];
      setActions(nextActions);

      const defaults = new Set<number>();
      nextActions.forEach((action, index) => {
        if (action.canAutoSolve) defaults.add(index);
      });
      setSelected(defaults);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze auto-solvable actions. Please verify AI key.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const executeSelected = async () => {
    const picked = actions.filter((_, index) => selected.has(index));
    if (picked.length === 0) return;

    setExecuting(true);
    setError('');
    try {
      for (const action of picked) {
        const resultNote = action.autoSolveResult?.trim()
          ? `\n\nAI Auto-Solved Output:\n${action.autoSolveResult.trim()}`
          : '';

        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: itemId,
            title: action.title,
            description: `${action.description || ''}${resultNote}`.trim(),
            priority: action.priority || 'medium',
            status: action.canAutoSolve ? 'done' : 'todo',
          }),
        });
      }

      onCompleted();
      setActions([]);
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      setError('Failed while creating auto-solve items. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          AI Auto Solve
        </p>
        <p className="text-xs leading-relaxed text-[#6f6352]">
          Let AI pick actions it can complete immediately and create them as
          done.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-[#efc8c2] bg-[#fbebe9] p-2.5">
          <p className="text-xs text-[#9b3a32]">{error}</p>
        </div>
      )}

      {actions.length === 0 ? (
        <button
          onClick={fetchActions}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#d26a3b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:cursor-not-allowed disabled:bg-[#d5c7b4]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Auto-Solvable Actions
            </>
          )}
        </button>
      ) : (
        <>
          <div className="space-y-2.5">
            {actions.map((action, index) => (
              <button
                key={`${action.title}-${index}`}
                onClick={() => toggleAction(index)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  selected.has(index)
                    ? 'border-[#d29a58] bg-[#faedd8] shadow-[0_8px_18px_rgba(95,67,31,0.12)]'
                    : 'border-[#dbc9ad] bg-white/85 hover:border-[#cc9c63]'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#2f271c]">
                    {action.title}
                  </p>
                  <span
                    className={`rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${
                      action.canAutoSolve
                        ? 'bg-[#d6f0e3] text-[#2c755b]'
                        : 'bg-[#ece8df] text-[#6e6252]'
                    }`}
                  >
                    {action.canAutoSolve ? 'Auto' : 'Manual'}
                  </span>
                </div>
                {action.description && (
                  <p className="text-[11px] leading-relaxed text-[#6f6352]">
                    {action.description}
                  </p>
                )}
                {typeof action.confidence === 'number' && (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#8a5529]">
                    {Math.round(action.confidence * 100)}% confidence
                  </p>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={executeSelected}
            disabled={executing || selected.size === 0}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2f7b65] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#286a58] disabled:cursor-not-allowed disabled:bg-[#9ebbb1]"
          >
            {executing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Execute {selected.size} Selected Action
                {selected.size > 1 ? 's' : ''}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
