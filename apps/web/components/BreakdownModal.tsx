'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimatedHours?: number;
}

interface BreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tasks: Task[]) => void;
  type: 'problem' | 'task';
  id: string;
  title: string;
}

export function BreakdownModal({ isOpen, onClose, onConfirm, type, id, title }: BreakdownModalProps) {
  const [loading, setLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, text: title, title })
      });

      if (!res.ok) throw new Error('Failed to generate breakdown');

      const data = await res.json();
      setSuggestedTasks(data.tasks);
    } catch (err) {
      setError('Failed to generate breakdown. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(suggestedTasks);
    setSuggestedTasks([]);
    onClose();
  };

  const handleCancel = () => {
    setSuggestedTasks([]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">AI Breakdown</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Breaking down {type}:</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{title}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {suggestedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Use AI to break this {type} into smaller, actionable {type === 'problem' ? 'tasks' : 'subtasks'}.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Breakdown
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Suggested {type === 'problem' ? 'Tasks' : 'Subtasks'} ({suggestedTasks.length})
              </h3>
              <div className="space-y-3">
                {suggestedTasks.map((task, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    {task.estimatedHours && (
                      <p className="text-xs text-gray-500">
                        ⏱️ Est. {task.estimatedHours}h
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 disabled:opacity-50"
              >
                Regenerate
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Create {suggestedTasks.length} {type === 'problem' ? 'Tasks' : 'Subtasks'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
