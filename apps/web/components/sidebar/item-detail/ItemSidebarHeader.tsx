import { X, Save } from 'lucide-react';

interface ItemSidebarHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ItemSidebarHeader({ isEditing, onClose, onSave }: ItemSidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
      <h2 className="text-lg font-semibold text-stone-900">Item Details</h2>
      <div className="flex items-center gap-2">
        {isEditing && (
          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
