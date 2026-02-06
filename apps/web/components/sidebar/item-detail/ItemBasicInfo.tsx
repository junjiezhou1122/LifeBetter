import type { Item } from '@/types';

interface ItemBasicInfoProps {
  item: Item;
  editedItem: Item;
  isEditing: boolean;
  onEditedItemChange: (item: Item) => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-[#2f7b65]' },
  { value: 'medium', label: 'Medium', color: 'bg-[#cc8e2e]' },
  { value: 'high', label: 'High', color: 'bg-[#cf6b35]' },
  { value: 'urgent', label: 'Urgent', color: 'bg-[#b73b30]' }
];

export function ItemBasicInfo({ item, editedItem, isEditing, onEditedItemChange }: ItemBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          Title
        </label>
        {isEditing ? (
          <input
            type="text"
            value={editedItem.title}
            onChange={(e) => onEditedItemChange({ ...editedItem, title: e.target.value })}
            className="lb-input w-full rounded-lg px-2.5 py-2 text-sm"
          />
        ) : (
          <h3 className="text-lg font-semibold text-[#2f271c]">{item.title}</h3>
        )}
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          Description
        </label>
        {isEditing ? (
          <textarea
            value={editedItem.description || ''}
            onChange={(e) => onEditedItemChange({ ...editedItem, description: e.target.value })}
            placeholder="Brief description..."
            className="lb-input w-full resize-none rounded-lg px-2.5 py-2 text-xs"
            rows={3}
          />
        ) : (
          <p className="text-sm leading-relaxed text-[#6e604f]">
            {item.description || <span className="italic text-[#a09380]">No description</span>}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          Priority
        </label>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-1.5">
            {priorities.map(p => (
              <button
                key={p.value}
                onClick={() => onEditedItemChange({ ...editedItem, priority: p.value })}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
                  editedItem.priority === p.value
                    ? `${p.color} text-white shadow-sm`
                    : 'border border-[#ddcbaf] bg-white/70 text-[#6b5e4c] hover:bg-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-semibold ${
            item.priority === 'urgent' ? 'bg-[#f9e9e7] text-[#9d3c33]' :
            item.priority === 'high' ? 'bg-[#faebde] text-[#9a4d1f]' :
            item.priority === 'medium' ? 'bg-[#faefdc] text-[#8a5b26]' :
            'bg-[#e9f5ef] text-[#2f7b65]'
          }`}>
            {item.priority}
          </span>
        )}
      </div>
    </div>
  );
}
