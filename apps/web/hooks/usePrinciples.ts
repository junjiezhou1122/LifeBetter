import { useState, useEffect, useCallback } from 'react';
import type { Principle } from '@/lib/types';

export function usePrinciples() {
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrinciples = useCallback(async () => {
    try {
      const res = await fetch('/api/principles');
      const data = await res.json();
      setPrinciples(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch principles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrinciples();
  }, [fetchPrinciples]);

  const createPrinciple = useCallback(async (data: {
    name: string;
    description?: string;
    howToApply: string;
    triggers?: Principle['triggers'];
    source?: Principle['source'];
  }) => {
    const res = await fetch('/api/principles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const created = await res.json();
    if (res.ok) {
      setPrinciples((prev) => [...prev, created]);
    }
    return created;
  }, []);

  const updatePrinciple = useCallback(async (id: string, updates: Partial<Principle>) => {
    const res = await fetch('/api/principles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    const updated = await res.json();
    if (res.ok) {
      setPrinciples((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  }, []);

  const deletePrinciple = useCallback(async (id: string) => {
    await fetch(`/api/principles?id=${id}`, { method: 'DELETE' });
    setPrinciples((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const suggestForTask = useCallback(async (taskTitle: string, taskDescription?: string, taskTags?: string[]) => {
    const res = await fetch('/api/principles/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle, taskDescription, taskTags }),
    });
    const data = await res.json();
    return data.suggestions || [];
  }, []);

  const extractFromExperiences = useCallback(async (experienceIds?: string[]) => {
    const res = await fetch('/api/principles/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experienceIds }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchPrinciples();
    }
    return data;
  }, [fetchPrinciples]);

  return {
    principles,
    loading,
    fetchPrinciples,
    createPrinciple,
    updatePrinciple,
    deletePrinciple,
    suggestForTask,
    extractFromExperiences,
  };
}
