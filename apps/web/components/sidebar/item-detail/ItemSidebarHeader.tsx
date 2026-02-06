import { X, Save } from 'lucide-react';

interface ItemSidebarHeaderProps {
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ItemSidebarHeader({ isEditing, onClose, onSave }: ItemSidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#dec9a8] bg-[linear-gradient(120deg,#fff7ea,#f8e9d0)] px-4 py-3">
      <h2 className="lb-display text-lg font-semibold text-[#2e2418]">Item Details</h2>
      <div className="flex items-center gap-2">
        {isEditing && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-md bg-[#d26a3b] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#bb5a2f]"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        )}
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-[#8e7e67] transition-colors hover:bg-white/70 hover:text-[#5f513e]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
