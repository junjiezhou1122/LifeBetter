import { useState, useEffect } from 'react';
import type { MetaSkill } from '@/types';

export function useMetaSkills() {
  const [metaSkills, setMetaSkills] = useState<MetaSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetaSkills();
  }, []);

  const fetchMetaSkills = async () => {
    try {
      const res = await fetch('/api/meta-skills');
      const data = await res.json();
      setMetaSkills(data);
    } catch (error) {
      console.error('Failed to fetch meta-skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetaSkillById = (id: string) => {
    return metaSkills.find((ms) => ms.id === id);
  };

  const updateMetaSkill = async (id: string, updates: Partial<MetaSkill>) => {
    try {
      await fetch('/api/meta-skills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });

      setMetaSkills((prev) =>
        prev.map((ms) =>
          ms.id === id ? { ...ms, ...updates } : ms,
        ),
      );

      return true;
    } catch (error) {
      console.error('Failed to update meta-skill:', error);
      throw error;
    }
  };

  return {
    metaSkills,
    loading,
    getMetaSkillById,
    updateMetaSkill,
  };
}
