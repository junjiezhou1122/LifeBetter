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
    <div className="flex gap-1.5 border-t border-[#dec9a8] pt-3">
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="rounded-lg border border-[#d9c7aa] bg-white/80 px-3 py-2 text-xs font-semibold text-[#6d5f4f] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Regenerate suggestions"
      >
        Regenerate
      </button>
      <button
        onClick={onConfirm}
        disabled={selectedTasksCount === 0}
        className="flex-1 rounded-lg bg-[#d26a3b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:cursor-not-allowed disabled:bg-[#d5c7b4]"
        aria-label={`Create ${selectedTasksCount} sub-item${selectedTasksCount !== 1 ? 's' : ''}`}
      >
        Create {selectedTasksCount} {selectedTasksCount === 1 ? 'Item' : 'Items'}
      </button>
    </div>
  );
}
