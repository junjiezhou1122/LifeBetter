import { Tag, X, Plus } from 'lucide-react';
import type { Item } from '@/types';

interface ItemTagsProps {
  item: Item;
  editedItem: Item;
  isEditing: boolean;
  newTag: string;
  onEditedItemChange: (item: Item) => void;
  onNewTagChange: (tag: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export function ItemTags({
  item,
  editedItem,
  isEditing,
  newTag,
  onEditedItemChange,
  onNewTagChange,
  onAddTag,
  onRemoveTag
}: ItemTagsProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {(editedItem.tags ?? []).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md"
          >
            <Tag className="w-3 h-3" />
            {tag}
            {isEditing && (
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {isEditing && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => onNewTagChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddTag()}
            placeholder="Add tag..."
            className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={onAddTag}
            className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
