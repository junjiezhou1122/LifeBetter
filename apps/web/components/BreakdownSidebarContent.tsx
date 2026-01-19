'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface BreakdownSidebarContentProps {
  type: 'problem' | 'task';
  id: string;
  title: string;
  onConfirm: () => void;
}

export function BreakdownSidebarContent({ type, id, title, onConfirm }: BreakdownSidebarContentProps) {
  const [loading, setLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<any[]>([]);
  const [error, setError] = useState('');

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
      setError('Failed to generate breakdown. Please check your API key configuration.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    setSuggestedTasks([]);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">Breaking down {type}:</p>
        <p className="text-sm font-medium text-gray-900 mt-1">{title}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
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
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              Suggested {type === 'problem' ? 'Tasks' : 'Subtasks'} ({suggestedTasks.length})
            </h3>
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
                  <p className="text-xs text-gray-500">⏱️ Est. {task.estimatedHours}h</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
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
  );
}
