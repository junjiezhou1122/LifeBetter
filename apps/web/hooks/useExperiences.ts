import { useState, useEffect, useCallback } from 'react';
import type { Experience } from '@/lib/types';

export function useExperiences(taskId?: string) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiences = useCallback(async () => {
    try {
      const url = taskId ? `/api/experiences?taskId=${taskId}` : '/api/experiences';
      const res = await fetch(url);
      const data = await res.json();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const createExperience = useCallback(async (taskId: string, content: string) => {
    const res = await fetch('/api/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, content }),
    });
    const created = await res.json();
    if (res.ok) {
      setExperiences((prev) => [...prev, created]);
    }
    return created;
  }, []);

  const updateExperience = useCallback(async (id: string, content: string) => {
    const res = await fetch('/api/experiences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content }),
    });
    const updated = await res.json();
    if (res.ok) {
      setExperiences((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  }, []);

  return { experiences, loading, fetchExperiences, createExperience, updateExperience };
}
