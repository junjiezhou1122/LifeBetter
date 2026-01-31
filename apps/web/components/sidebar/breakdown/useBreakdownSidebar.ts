import { useState, useEffect } from 'react';

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

export function useBreakdownSidebar(itemId: string, title: string, onConfirm: () => void) {
  const [loading, setLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [metaSkillSuggestions, setMetaSkillSuggestions] = useState<MetaSkillSuggestion[]>([]);
  const [selectedMetaSkill, setSelectedMetaSkill] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

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
      setSelectedTasks(new Set(data.tasks.map((_: any, index: number) => index)));
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
    const tasksToCreate = suggestedTasks.filter((_, index) => selectedTasks.has(index));

    try {
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

  return {
    loading,
    suggestedTasks,
    selectedTasks,
    error,
    metaSkillSuggestions,
    showSuggestions,
    handleGenerate,
    toggleTask,
    toggleAll,
    handleConfirm
  };
}
