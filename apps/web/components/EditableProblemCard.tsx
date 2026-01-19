'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableProblemCardProps {
  onSave: (text: string, priority: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: '🟢 Low', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: '🟡 Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: '🟠 High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: '🔴 Urgent', color: 'bg-red-100 text-red-700' },
];

export function EditableProblemCard({ onSave, onCancel, autoFocus = true }: EditableProblemCardProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim(), priority);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-orange-500 p-4 mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Priority selector */}
      <div className="flex gap-2 mb-3">
        {PRIORITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setPriority(option.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              priority === option.value
                ? option.color + ' ring-2 ring-offset-1 ring-orange-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Text input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your problem... (Cmd/Ctrl+Enter to save, Esc to cancel)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        rows={3}
      />

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘/Ctrl+Enter</kbd> to save
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="p-2 text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Save (Cmd/Ctrl+Enter)"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
