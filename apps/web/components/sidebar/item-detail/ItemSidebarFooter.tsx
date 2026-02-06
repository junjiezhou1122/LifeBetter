interface ItemSidebarFooterProps {
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ItemSidebarFooter({ isEditing, onEdit, onCancel, onSave }: ItemSidebarFooterProps) {
  return (
    <div className="border-t border-[#dec9a8] bg-[#fff3de]/70 px-4 py-3">
      {!isEditing ? (
        <button
          onClick={onEdit}
          className="w-full rounded-lg bg-[#d26a3b] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#bb5a2f]"
        >
          Edit Item
        </button>
      ) : (
        <div className="flex gap-1.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[#dac8ab] bg-white/80 px-3 py-2 text-sm font-medium text-[#6d5f4f] transition-colors hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 rounded-lg bg-[#d26a3b] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#bb5a2f]"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
