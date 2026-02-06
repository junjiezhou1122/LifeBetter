'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableItemCardProps {
  onSave: (title: string, description: string, priority: string) => void;
  onCancel: () => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-[#2f7b65]' },
  { value: 'medium', label: 'Medium', color: 'bg-[#cc8e2e]' },
  { value: 'high', label: 'High', color: 'bg-[#cf6b35]' },
  { value: 'urgent', label: 'Urgent', color: 'bg-[#b73b30]' }
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
    <div className="mb-2.5 rounded-xl border border-[#cfb48e] bg-[linear-gradient(180deg,#fffefb,#fff5e8)] p-2.5 shadow-[0_8px_20px_rgba(110,84,45,0.14)] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {priorities.map(p => (
          <button
            key={p.value}
            onClick={() => setPriority(p.value)}
            className={`w-full rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
              priority === p.value
                ? `${p.color} text-white shadow-sm`
                : 'border border-[#ddcbaf] bg-white/70 text-[#6b5e4c] hover:bg-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Item title..."
        className="lb-input w-full resize-none rounded-lg px-2.5 py-2 text-sm placeholder:text-[#8d7f6a]"
        rows={1}
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Description (optional)..."
        className="lb-input mt-1.5 w-full resize-none rounded-lg px-2.5 py-1.5 text-xs placeholder:text-[#8d7f6a]"
        rows={2}
      />

      <div className="mt-2 flex flex-col gap-1.5 border-t border-[#eadbc4] pt-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] leading-snug text-[#7b6f5d]">
          ⌘+Enter to save • Esc to cancel
        </span>
        <div className="flex justify-end gap-1.5">
          <button
            onClick={onCancel}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[#6d5f4f] transition-colors hover:bg-[#f7ead6] hover:text-[#42372a]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-md bg-[#d26a3b] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#bb5a2f] disabled:cursor-not-allowed disabled:bg-[#d5c7b4]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
