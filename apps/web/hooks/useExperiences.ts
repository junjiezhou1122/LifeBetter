import { useState, useEffect, useCallback } from 'react';
import type { Experience, ExperienceOutcome } from '@/lib/types';

export function useExperiences(taskId?: string) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiences = useCallback(async () => {
    try {
      const res = await fetch('/api/experiences');
      const data = await res.json();
      const all: Experience[] = Array.isArray(data) ? data : [];
      setExperiences(taskId ? all.filter((e) => e.taskId === taskId) : all);
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const createExperience = useCallback(async (exp: {
    taskId: string;
    task: string;
    approach: string;
    outcome: ExperienceOutcome;
    timeSpent?: number;
    feedback?: string;
    retrospective?: Experience['retrospective'];
    context?: Experience['context'];
  }) => {
    const res = await fetch('/api/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exp),
    });
    const created = await res.json();
    if (res.ok) {
      setExperiences((prev) => [...prev, created]);
    }
    return created;
  }, []);

  const updateExperience = useCallback(async (id: string, updates: Partial<Experience>) => {
    const res = await fetch('/api/experiences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    const updated = await res.json();
    if (res.ok) {
      setExperiences((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  }, []);

  return { experiences, loading, fetchExperiences, createExperience, updateExperience };
}
