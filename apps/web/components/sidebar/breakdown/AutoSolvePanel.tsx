'use client';

import { useMemo, useState } from 'react';
import { Bot, GitBranch, Loader2, Sparkles, Wand2 } from 'lucide-react';

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
  nextStepType?: 'breakdown' | 'manual-first-principle';
  suggestedBreakdown?: string[];
  lineage?: string[];
  iteration?: number;
}

interface AutoSolveSummary {
  autoSolvable: number;
  requiresBreakdown: number;
  firstPrincipleManual: number;
  iterationsUsed: number;
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
  const [summary, setSummary] = useState<AutoSolveSummary | null>(null);

  const grouped = useMemo(
    () => ({
      auto: actions.filter((action) => action.canAutoSolve).length,
      needsBreakdown: actions.filter((action) => action.nextStepType === 'breakdown').length,
      firstPrinciple: actions.filter((action) => action.nextStepType === 'manual-first-principle').length,
    }),
    [actions],
  );

  const groupedByIteration = useMemo(() => {
    const map = new Map<number, Array<{ action: AutoSolveAction; index: number }>>();

    actions.forEach((action, index) => {
      const iteration = action.iteration && action.iteration > 0 ? action.iteration : 1;
      const current = map.get(iteration) || [];
      current.push({ action, index });
      map.set(iteration, current);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([iteration, items]) => ({ iteration, items }));
  }, [actions]);

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
      const nextSummary = (data.summary || null) as AutoSolveSummary | null;

      setActions(nextActions);
      setSummary(nextSummary);

      const defaults = new Set<number>();
      nextActions.forEach((action, index) => {
        if (action.canAutoSolve) {
          defaults.add(index);
        }
      });
      setSelected(defaults);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze auto-solve flow. Please verify AI key and retry.');
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
        const notes: string[] = [];

        if (action.autoSolveResult?.trim()) {
          notes.push(`AI Auto-Solved Output:\n${action.autoSolveResult.trim()}`);
        }

        if (action.suggestedBreakdown && action.suggestedBreakdown.length > 0) {
          notes.push(
            `Recommended Next Breakdown:\n${action.suggestedBreakdown
              .map((step, index) => `${index + 1}. ${step}`)
              .join('\n')}`,
          );
        }

        if (action.lineage && action.lineage.length > 1) {
          notes.push(`Lineage: ${action.lineage.join(' -> ')}`);
        }

        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: itemId,
            title: action.title,
            description: [action.description || '', ...notes].filter(Boolean).join('\n\n').trim(),
            priority: action.priority || 'medium',
            status: action.canAutoSolve ? 'done' : 'todo',
          }),
        });
      }

      onCompleted();
      setActions([]);
      setSummary(null);
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
          After breakdown, AI will recursively solve what it can. For tasks it cannot solve,
          AI keeps suggesting deeper breakdown until first-principle manual steps.
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#8a7b67]">
          You can run this directly. If no breakdown exists yet, AI starts from the current item.
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
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2f7b65] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#286a58] disabled:cursor-not-allowed disabled:bg-[#9ebbb1]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing recursively...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze + Recursive Auto Solve
            </>
          )}
        </button>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-[#dbc9ad] bg-[#fff8ec] p-2">
            <div className="rounded-md bg-[#e4f3ec] px-2 py-1 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#3a6d5c]">Auto</p>
              <p className="text-sm font-semibold text-[#1f5b47]">{grouped.auto}</p>
            </div>
            <div className="rounded-md bg-[#f8ead5] px-2 py-1 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#8a5529]">Breakdown</p>
              <p className="text-sm font-semibold text-[#7a4b23]">{grouped.needsBreakdown}</p>
            </div>
            <div className="rounded-md bg-[#f0ece4] px-2 py-1 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#6d6252]">First Principle</p>
              <p className="text-sm font-semibold text-[#5c5144]">{grouped.firstPrinciple}</p>
            </div>
          </div>

          {summary && (
            <p className="text-[11px] text-[#7a6d5d]">
              Completed in {summary.iterationsUsed} iteration{summary.iterationsUsed > 1 ? 's' : ''}.
            </p>
          )}

          <div className="space-y-3">
            {groupedByIteration.map((group) => {
              const roundAuto = group.items.filter((item) => item.action.canAutoSolve).length;
              const roundBreakdown = group.items.filter(
                (item) => item.action.nextStepType === 'breakdown',
              ).length;
              const roundManual = group.items.filter(
                (item) => item.action.nextStepType === 'manual-first-principle',
              ).length;

              return (
                <div
                  key={`iteration-${group.iteration}`}
                  className="rounded-lg border border-[#dbc9ad] bg-[#fffbf3] p-2"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1 rounded-full bg-[#f3ece0] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7f715d]">
                      <Wand2 className="h-3 w-3" />
                      Round {group.iteration}
                    </p>
                    <p className="text-[10px] text-[#7b6e5d]">
                      {roundAuto} auto · {roundBreakdown} breakdown · {roundManual} manual
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {group.items.map(({ action, index }) => (
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
                          <p className="text-xs font-semibold text-[#2f271c]">{action.title}</p>
                          <span
                            className={`rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${
                              action.canAutoSolve
                                ? 'bg-[#d6f0e3] text-[#2c755b]'
                                : action.nextStepType === 'manual-first-principle'
                                  ? 'bg-[#ece8df] text-[#6e6252]'
                                  : 'bg-[#f7e5cc] text-[#8a5529]'
                            }`}
                          >
                            {action.canAutoSolve
                              ? 'Auto'
                              : action.nextStepType === 'manual-first-principle'
                                ? 'Manual'
                                : 'Break down'}
                          </span>
                        </div>

                        {action.description && (
                          <p className="text-[11px] leading-relaxed text-[#6f6352] whitespace-pre-line">
                            {action.description}
                          </p>
                        )}

                        {action.suggestedBreakdown && action.suggestedBreakdown.length > 0 && (
                          <div className="mt-2 rounded-md border border-[#e8d4b6] bg-[#fff7ea] px-2 py-1.5">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#805324]">
                              Suggested Next Breakdown
                            </p>
                            <div className="space-y-0.5">
                              {action.suggestedBreakdown.slice(0, 3).map((step, stepIndex) => (
                                <p
                                  key={`${index}-${stepIndex}`}
                                  className="text-[11px] text-[#6f6352]"
                                >
                                  {stepIndex + 1}. {step}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {(action.iteration || action.lineage?.length) && (
                          <div className="mt-2 flex items-center gap-2 text-[10px] text-[#8a7b67]">
                            {action.lineage && action.lineage.length > 1 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#f3ece0] px-2 py-0.5">
                                <GitBranch className="h-3 w-3" />
                                Depth {action.lineage.length - 1}
                              </span>
                            ) : null}
                          </div>
                        )}

                        {typeof action.confidence === 'number' && (
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#8a5529]">
                            {Math.round(action.confidence * 100)}% confidence
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={executeSelected}
            disabled={executing || selected.size === 0}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#d26a3b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:cursor-not-allowed disabled:bg-[#d5c7b4]"
          >
            {executing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating items...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Create {selected.size} Selected Item{selected.size > 1 ? 's' : ''}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
