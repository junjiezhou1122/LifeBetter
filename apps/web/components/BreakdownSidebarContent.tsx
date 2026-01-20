'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckSquare, Square, Brain, Lightbulb } from 'lucide-react';

interface BreakdownSidebarContentProps {
  itemId: string;
  title: string;
  parentId: string | null;
  onConfirm: () => void;
}

interface SuggestedTask {
  title: string;
  description?: string;
  priority: string;
  estimatedHours?: number;
}

interface MetaSkillSuggestion {
  metaSkillId: string;
  metaSkillName: string;
  metaSkillDescription: string;
  category: string;
  confidence: number;
  reason: string;
  successRate: number | null;
}

export function BreakdownSidebarContent({ itemId, title, parentId, onConfirm }: BreakdownSidebarContentProps) {
  const [loading, setLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [metaSkillSuggestions, setMetaSkillSuggestions] = useState<MetaSkillSuggestion[]>([]);
  const [selectedMetaSkill, setSelectedMetaSkill] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Fetch AI suggestions on mount
  useEffect(() => {
    fetchMetaSkillSuggestions();
  }, [itemId, title]);

  const fetchMetaSkillSuggestions = async () => {
    try {
      const res = await fetch('/api/meta-skills/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemTitle: title })
      });

      if (res.ok) {
        const data = await res.json();
        setMetaSkillSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to fetch meta-skill suggestions:', err);
    }
  };

  const handleGenerate = async (metaSkillId?: string) => {
    setLoading(true);
    setError('');

    // Save which meta-skill was selected
    if (metaSkillId) {
      setSelectedMetaSkill(metaSkillId);
    }

    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          title,
          metaSkillId: metaSkillId || selectedMetaSkill
        })
      });

      if (!res.ok) throw new Error('Failed to generate breakdown');

      const data = await res.json();
      setSuggestedTasks(data.tasks);
      // Select all tasks by default
      setSelectedTasks(new Set(data.tasks.map((_: any, index: number) => index)));

      // Hide suggestions after generating
      setShowSuggestions(false);
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
      // Create each selected task as a sub-item
      for (const task of tasksToCreate) {
        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: itemId,
            title: task.title,
            description: task.description || '',
            priority: task.priority || 'medium',
            status: 'todo'
          })
        });
      }

      // If a meta-skill was used, update the parent item to track it
      if (selectedMetaSkill) {
        await fetch('/api/items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: itemId,
            updates: {
              metaSkillIds: [selectedMetaSkill],
              solvedWithMetaSkill: selectedMetaSkill
            }
          })
        });
      }

      onConfirm();
      setSuggestedTasks([]);
      setSelectedTasks(new Set());
      setSelectedMetaSkill(null);
    } catch (err) {
      setError('Failed to create items. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Item Info - Make it stand out */}
      <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
        <p className="text-xs font-medium text-stone-500 mb-2">Breaking down</p>
        <p className="text-base font-semibold text-stone-900 leading-relaxed">{title}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {suggestedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {/* Meta-Skill Suggestions */}
          {showSuggestions && metaSkillSuggestions.length > 0 && (
            <div className="w-full mb-8 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-stone-900">
                  AI Suggests These Approaches
                </h3>
              </div>

              {metaSkillSuggestions.map((suggestion) => (
                <div
                  key={suggestion.metaSkillId}
                  className="bg-white border-2 border-stone-200 rounded-xl p-4 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-500" />
                      <h4 className="font-semibold text-stone-900 text-sm">
                        {suggestion.metaSkillName}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">
                      {Math.round(suggestion.confidence * 100)}% match
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                    {suggestion.reason}
                  </p>

                  {suggestion.successRate !== null && (
                    <p className="text-xs text-green-600 font-medium mb-3">
                      ✓ {suggestion.successRate}% success rate
                    </p>
                  )}

                  <button
                    onClick={() => handleGenerate(suggestion.metaSkillId)}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Generating...' : `Use ${suggestion.metaSkillName}`}
                  </button>
                </div>
              ))}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-stone-100 px-2 text-stone-500">or</span>
                </div>
              </div>
            </div>
          )}

          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-base font-semibold text-stone-900 mb-2">
            AI Breakdown
          </h3>
          <p className="text-sm text-stone-500 text-center mb-8 max-w-xs leading-relaxed">
            {metaSkillSuggestions.length > 0
              ? 'Or generate a generic breakdown without a specific strategy'
              : 'Let AI break this into smaller, actionable sub-items'}
          </p>
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
            aria-label="Generate AI breakdown"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generic Breakdown
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900">
                Suggested Sub-Items ({suggestedTasks.length})
              </h3>
              <button
                onClick={toggleAll}
                className="text-xs text-stone-700 hover:text-stone-900 font-semibold"
                aria-label={selectedTasks.size === suggestedTasks.length ? 'Deselect all items' : 'Select all items'}
              >
                {selectedTasks.size === suggestedTasks.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-3">
              {suggestedTasks.map((task, index) => (
                <div
                  key={index}
                  onClick={() => toggleTask(index)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedTasks.has(index)
                      ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-200'
                      : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm'
                  }`}
                  role="checkbox"
                  aria-checked={selectedTasks.has(index)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTask(index);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      {selectedTasks.has(index) ? (
                        <CheckSquare className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-stone-900 leading-relaxed">{task.title}</h4>
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-stone-600 mb-2 leading-relaxed">{task.description}</p>
                      )}
                      {task.estimatedHours && (
                        <p className="text-xs text-stone-500 font-medium">⏱ {task.estimatedHours}h estimated</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-stone-200">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2.5 border-2 border-stone-300 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-50 hover:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Regenerate suggestions"
            >
              Regenerate
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedTasks.size === 0}
              className="flex-1 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
              aria-label={`Create ${selectedTasks.size} sub-item${selectedTasks.size !== 1 ? 's' : ''}`}
            >
              Create {selectedTasks.size} {selectedTasks.size === 1 ? 'Item' : 'Items'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
