'use client';

import { useState } from 'react';
import { Sparkles, Loader2, CheckSquare, Square } from 'lucide-react';

interface BreakdownSidebarContentProps {
  type: 'problem' | 'task';
  id: string;
  title: string;
  problemId?: string; // For task breakdowns, we need the problemId
  onConfirm: () => void;
}

interface SuggestedTask {
  title: string;
  description?: string;
  priority: string;
  estimatedHours?: number;
}

export function BreakdownSidebarContent({ type, id, title, problemId, onConfirm }: BreakdownSidebarContentProps) {
  const [loading, setLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
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
      // Select all tasks by default
      setSelectedTasks(new Set(data.tasks.map((_: any, index: number) => index)));
    } catch (err) {
      setError('Failed to generate breakdown. Please check your API key configuration.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (index: number) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedTasks.size === suggestedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(suggestedTasks.map((_, index) => index)));
    }
  };

  const handleConfirm = async () => {
    // Create only the selected tasks
    const tasksToCreate = suggestedTasks.filter((_, index) => selectedTasks.has(index));

    try {
      // Create each selected task
      for (const task of tasksToCreate) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId: type === 'problem' ? id : problemId,
            parentTaskId: type === 'task' ? id : undefined,
            title: task.title,
            description: task.description || '',
            priority: task.priority || 'medium',
            status: 'todo'
          })
        });
      }

      onConfirm();
      setSuggestedTasks([]);
      setSelectedTasks(new Set());
    } catch (err) {
      setError('Failed to create tasks. Please try again.');
      console.error(err);
    }
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Suggested {type === 'problem' ? 'Tasks' : 'Subtasks'} ({suggestedTasks.length})
              </h3>
              <button
                onClick={toggleAll}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                {selectedTasks.size === suggestedTasks.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            {suggestedTasks.map((task, index) => (
              <div
                key={index}
                onClick={() => toggleTask(index)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedTasks.has(index)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {selectedTasks.has(index) ? (
                      <CheckSquare className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 ml-2">
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
                </div>
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
              disabled={selectedTasks.size === 0}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create {selectedTasks.size} {type === 'problem' ? 'Task' : 'Subtask'}{selectedTasks.size !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
