interface ItemSidebarFooterProps {
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ItemSidebarFooter({ isEditing, onEdit, onCancel, onSave }: ItemSidebarFooterProps) {
  return (
    <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
      {!isEditing ? (
        <button
          onClick={onEdit}
          className="w-full px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          Edit Item
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
