"use client";

import { Sparkles } from "lucide-react";
import { AutoSolvePanel } from "./AutoSolvePanel";
import { TaskList } from "./TaskList";
import { BreakdownActions } from "./BreakdownActions";
import { useBreakdownSidebar } from "./useBreakdownSidebar";

interface BreakdownSidebarContentProps {
  itemId: string;
  title: string;
  itemNotes?: string;
  onNotesUpdate?: (notes: string) => void;
  onConfirm: () => void;
}

export function BreakdownSidebarContent({
  itemId,
  title,
  itemNotes = "",
  onNotesUpdate,
  onConfirm,
}: BreakdownSidebarContentProps) {
  const {
    loading,
    suggestedTasks,
    selectedTasks,
    error,
    handleGenerate,
    toggleTask,
    toggleAll,
    handleConfirm,
  } = useBreakdownSidebar(itemId, title, onConfirm);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          AI Planner + Solver
        </p>
        <p className="text-sm font-semibold leading-relaxed text-[#2f271c]">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#7b6e5b]">
          AI automatically decides whether each step should be solved now, broken down further,
          or handled by a human with concrete advice.
        </p>
      </div>

      <AutoSolvePanel
        itemId={itemId}
        title={title}
        existingNotes={itemNotes}
        onNotesApplied={onNotesUpdate}
        breakdownSeedTasks={suggestedTasks}
        onCompleted={onConfirm}
      />

      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
              Optional Manual Breakdown
            </p>
            <p className="text-[11px] leading-relaxed text-[#7b6e5b]">
              If you want explicit sub-items, run dedicated breakdown and choose what to create.
            </p>
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#d26a3b] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#bb5a2f] disabled:cursor-not-allowed disabled:bg-[#d5c7b4]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? "Running..." : "Break down"}
          </button>
        </div>

        {error && (
          <div className="mb-2 rounded-lg border border-[#efc8c2] bg-[#fbebe9] p-2.5">
            <p className="text-xs text-[#9b3a32]">{error}</p>
          </div>
        )}

        {suggestedTasks.length > 0 && (
          <div className="space-y-3">
            <TaskList
              tasks={suggestedTasks}
              selectedTasks={selectedTasks}
              onToggleTask={toggleTask}
              onToggleAll={toggleAll}
            />
            <BreakdownActions
              loading={loading}
              selectedTasksCount={selectedTasks.size}
              onRegenerate={() => handleGenerate()}
              onConfirm={handleConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
}
