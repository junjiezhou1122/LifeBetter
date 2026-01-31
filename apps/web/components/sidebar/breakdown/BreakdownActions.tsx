interface BreakdownActionsProps {
  loading: boolean;
  selectedTasksCount: number;
  onRegenerate: () => void;
  onConfirm: () => void;
}

export function BreakdownActions({
  loading,
  selectedTasksCount,
  onRegenerate,
  onConfirm
}: BreakdownActionsProps) {
  return (
    <div className="flex gap-3 pt-6 border-t border-stone-200">
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="px-4 py-2.5 border-2 border-stone-300 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-50 hover:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Regenerate suggestions"
      >
        Regenerate
      </button>
      <button
        onClick={onConfirm}
        disabled={selectedTasksCount === 0}
        className="flex-1 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
        aria-label={`Create ${selectedTasksCount} sub-item${selectedTasksCount !== 1 ? 's' : ''}`}
      >
        Create {selectedTasksCount} {selectedTasksCount === 1 ? 'Item' : 'Items'}
      </button>
    </div>
  );
}
