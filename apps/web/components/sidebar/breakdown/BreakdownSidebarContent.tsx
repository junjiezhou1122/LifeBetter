"use client";

import { BreakdownInitialState } from "./BreakdownInitialState";
import { TaskList } from "./TaskList";
import { BreakdownActions } from "./BreakdownActions";
import { useBreakdownSidebar } from "./useBreakdownSidebar";

interface BreakdownSidebarContentProps {
  itemId: string;
  title: string;
  parentId: string | null;
  onConfirm: () => void;
}

export function BreakdownSidebarContent({
  itemId,
  title,
  parentId,
  onConfirm,
}: BreakdownSidebarContentProps) {
  const {
    loading,
    suggestedTasks,
    selectedTasks,
    error,
    metaSkillSuggestions,
    showSuggestions,
    handleGenerate,
    toggleTask,
    toggleAll,
    handleConfirm,
  } = useBreakdownSidebar(itemId, title, onConfirm);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
        <p className="text-xs font-medium text-stone-500 mb-2">Breaking down</p>
        <p className="text-base font-semibold text-stone-900 leading-relaxed">
          {title}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
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
