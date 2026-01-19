'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditableItemCardProps {
  onSave: (title: string, description: string, priority: string) => void;
  onCancel: () => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

export function EditableItemCard({ onSave, onCancel }: EditableItemCardProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), description.trim(), priority);
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-stone-400 p-4 mb-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Priority Selector */}
      <div className="flex gap-2 mb-3">
        {priorities.map(p => (
          <button
            key={p.value}
            onClick={() => setPriority(p.value)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              priority === p.value
                ? `${p.color} text-white shadow-sm`
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Title Input */}
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Item title..."
        className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none placeholder:text-stone-400"
        rows={2}
      />

      {/* Description Input */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Description (optional)..."
        className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none mt-2 placeholder:text-stone-400"
        rows={2}
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
        <span className="text-xs text-stone-500">
          ⌘+Enter to save • Esc to cancel
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
