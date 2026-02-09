"use client";

import { useState } from "react";
import { BreakdownInitialState } from "./BreakdownInitialState";
import { TaskList } from "./TaskList";
import { BreakdownActions } from "./BreakdownActions";
import { useBreakdownSidebar } from "./useBreakdownSidebar";
import { AutoSolvePanel } from "./AutoSolvePanel";

interface BreakdownSidebarContentProps {
  itemId: string;
  title: string;
  onConfirm: () => void;
}

export function BreakdownSidebarContent({
  itemId,
  title,
  onConfirm,
}: BreakdownSidebarContentProps) {
  const [activeTab, setActiveTab] = useState<"breakdown" | "auto-solve">(
    "breakdown",
  );

  const {
    loading,
    suggestedTasks,
    selectedTasks,
    error,
    metaSkillSuggestions,
    handleGenerate,
    toggleTask,
    toggleAll,
    handleConfirm,
  } = useBreakdownSidebar(itemId, title, onConfirm);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#dbc9ad] bg-white/85 p-1 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <button
          onClick={() => setActiveTab("breakdown")}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            activeTab === "breakdown"
              ? "bg-[#d26a3b] text-white shadow-[0_4px_10px_rgba(210,106,59,0.22)]"
              : "text-[#7b6f5d] hover:bg-[#f2e1c7]"
          }`}
        >
          AI Breakdown
        </button>
        <button
          onClick={() => setActiveTab("auto-solve")}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            activeTab === "auto-solve"
              ? "bg-[#2f7b65] text-white shadow-[0_4px_10px_rgba(47,123,101,0.22)]"
              : "text-[#7b6f5d] hover:bg-[#e1eee9]"
          }`}
        >
          AI Auto Solve
        </button>
      </div>

      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">Breaking down</p>
        <p className="text-sm font-semibold leading-relaxed text-[#2f271c]">
          {title}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-[#efc8c2] bg-[#fbebe9] p-2.5">
          <p className="text-xs text-[#9b3a32]">{error}</p>
        </div>
      )}

      {activeTab === "breakdown" ? (
        suggestedTasks.length === 0 ? (
          <BreakdownInitialState
            metaSkillSuggestions={metaSkillSuggestions}
            loading={loading}
            onUseMetaSkill={(metaSkillId) => handleGenerate(metaSkillId)}
            onGenerateGeneric={() => handleGenerate()}
          />
        ) : (
          <>
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
          </>
        )
      ) : (
        <AutoSolvePanel
          itemId={itemId}
          title={title}
          suggestedTasks={suggestedTasks}
          onCompleted={onConfirm}
        />
      )}
    </div>
  );
}
