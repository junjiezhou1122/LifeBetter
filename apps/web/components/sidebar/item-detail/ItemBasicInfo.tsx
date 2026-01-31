import type { Item } from '@/types';

interface ItemBasicInfoProps {
  item: Item;
  editedItem: Item;
  isEditing: boolean;
  onEditedItemChange: (item: Item) => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

export function ItemBasicInfo({ item, editedItem, isEditing, onEditedItemChange }: ItemBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
          Title
        </label>
        {isEditing ? (
          <input
            type="text"
            value={editedItem.title}
            onChange={(e) => onEditedItemChange({ ...editedItem, title: e.target.value })}
            className="w-full px-3 py-2 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        ) : (
          <h3 className="text-xl font-semibold text-stone-900">{item.title}</h3>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
          Description
        </label>
        {isEditing ? (
          <textarea
            value={editedItem.description || ''}
            onChange={(e) => onEditedItemChange({ ...editedItem, description: e.target.value })}
            placeholder="Brief description..."
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            rows={3}
          />
        ) : (
          <p className="text-sm text-stone-700 leading-relaxed">
            {item.description || <span className="text-stone-400 italic">No description</span>}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
          Priority
        </label>
        {isEditing ? (
          <div className="flex gap-2">
            {priorities.map(p => (
              <button
                key={p.value}
                onClick={() => onEditedItemChange({ ...editedItem, priority: p.value })}
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  editedItem.priority === p.value
                    ? `${p.color} text-white shadow-sm`
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
            item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
            item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
            item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
            'bg-green-100 text-green-700'
          }`}>
            {item.priority}
          </span>
        )}
      </div>
    </div>
  );
}
