'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, GitBranch, Loader2, Sparkles, Wand2 } from 'lucide-react';

interface AutoSolveAction {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  canAutoSolve: boolean;
  autoSolveResult?: string;
  confidence?: number;
  nextStepType?: 'breakdown' | 'manual-first-principle';
  suggestedBreakdown?: string[];
  humanAdvice?: string;
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
  existingNotes: string;
  breakdownSeedTasks?: Array<{
    title: string;
    description?: string;
    priority?: string;
  }>;
  onNotesApplied?: (notes: string) => void;
  onCompleted: () => void;
}

export function AutoSolvePanel({
  itemId,
  title,
  existingNotes,
  breakdownSeedTasks = [],
  onNotesApplied,
  onCompleted,
}: AutoSolvePanelProps) {
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [actions, setActions] = useState<AutoSolveAction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState<AutoSolveSummary | null>(null);
  const [notesBase, setNotesBase] = useState(existingNotes || '');

  useEffect(() => {
    setNotesBase(existingNotes || '');
  }, [existingNotes, itemId]);

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
        body: JSON.stringify({ itemId, title, breakdownTasks: breakdownSeedTasks }),
      });

      if (!res.ok) throw new Error('Failed to analyze auto-solve');

      const data = await res.json();
      const nextActions = (data.actions || []) as AutoSolveAction[];
      const nextSummary = (data.summary || null) as AutoSolveSummary | null;

      setActions(nextActions);
      setSummary(nextSummary);

      const defaults = new Set<number>();
      nextActions.forEach((_, index) => {
        defaults.add(index);
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
      const now = new Date().toLocaleString();
      const notesLines: string[] = [
        `## AI Solve Session (${now})`,
        `Focus: ${title}`,
        '',
      ];

      picked.forEach((action, index) => {
        const status = action.canAutoSolve
          ? 'Solved by AI'
          : action.nextStepType === 'breakdown'
            ? 'Needs further breakdown'
            : 'Human required';

        notesLines.push(`### ${index + 1}. ${action.title}`);
        notesLines.push(`Status: ${status}`);

        if (action.description?.trim()) {
          notesLines.push(`Context: ${action.description.trim()}`);
        }

        if (action.autoSolveResult?.trim()) {
          notesLines.push('');
          notesLines.push('AI Output:');
          notesLines.push(action.autoSolveResult.trim());
        }

        if (action.suggestedBreakdown && action.suggestedBreakdown.length > 0) {
          notesLines.push('');
          notesLines.push('Suggested next breakdown:');
          action.suggestedBreakdown.forEach((step, stepIndex) => {
            notesLines.push(`${stepIndex + 1}. ${step}`);
          });
        }

        if (action.humanAdvice?.trim()) {
          notesLines.push('');
          notesLines.push('Human advice:');
          notesLines.push(action.humanAdvice.trim());
        }

        if (action.lineage && action.lineage.length > 1) {
          notesLines.push(`Lineage: ${action.lineage.join(' -> ')}`);
        }

        if (typeof action.confidence === 'number') {
          notesLines.push(`Confidence: ${Math.round(action.confidence * 100)}%`);
        }

        notesLines.push('');
      });

      const sessionBlock = notesLines.join('\n').trim();
      const mergedNotes = [notesBase?.trim() || '', sessionBlock]
        .filter(Boolean)
        .join('\n\n---\n\n');

      const response = await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          updates: {
            notes: mergedNotes,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item notes');
      }

      setNotesBase(mergedNotes);
      onNotesApplied?.(mergedNotes);
      onCompleted();
      setActions([]);
      setSummary(null);
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      setError('Failed to apply selected results to notes. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          Unified AI Decision
        </p>
        <p className="text-xs leading-relaxed text-[#6f6352]">
          AI recursively analyzes this item and classifies each step into 3 types:
          Solved by AI, Needs further breakdown, or Human required.
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#8a7b67]">
          Applying results writes a structured AI session directly into this item notes section.
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
              Run AI Plan + Solve
            </>
          )}
        </button>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-[#dbc9ad] bg-[#fff8ec] p-2">
            <div className="rounded-md bg-[#e4f3ec] px-2 py-1 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#3a6d5c]">Solved</p>
              <p className="text-sm font-semibold text-[#1f5b47]">{grouped.auto}</p>
            </div>
            <div className="rounded-md bg-[#f8ead5] px-2 py-1 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#8a5529]">Needs Breakdown</p>
              <p className="text-sm font-semibold text-[#7a4b23]">{grouped.needsBreakdown}</p>
            </div>
            <div className="rounded-md bg-[#f0ece4] px-2 py-1 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#6d6252]">Human Required</p>
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
                      {roundAuto} solved · {roundBreakdown} needs breakdown · {roundManual} human
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
                              ? 'Solved by AI'
                              : action.nextStepType === 'manual-first-principle'
                                ? 'Human required'
                                : 'Needs breakdown'}
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

                        {action.humanAdvice && (
                          <div className="mt-2 rounded-md border border-[#ddd4c6] bg-[#f7f2e8] px-2 py-1.5">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6f6250]">
                              Human Advice
                            </p>
                            <p className="text-[11px] leading-relaxed text-[#6f6352]">
                              {action.humanAdvice}
                            </p>
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
                Applying to notes...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Write {selected.size} AI Decision{selected.size > 1 ? 's' : ''} to Notes
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
