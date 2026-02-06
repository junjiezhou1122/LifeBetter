"use client";

import { BreakdownInitialState } from "./BreakdownInitialState";
import { TaskList } from "./TaskList";
import { BreakdownActions } from "./BreakdownActions";
import { useBreakdownSidebar } from "./useBreakdownSidebar";

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

      {suggestedTasks.length === 0 ? (
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
      )}
    </div>
  );
}
