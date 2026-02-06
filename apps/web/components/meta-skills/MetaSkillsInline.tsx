'use client';

import { useState, useEffect } from 'react';
import { Plus, Brain } from 'lucide-react';
import { MetaSkillCard } from './MetaSkillCard';
import { CreateMetaSkillModal } from './CreateMetaSkillModal';

interface MetaSkill {
  id: string;
  name: string;
  description: string;
  examples: string[];
  timesApplied: number;
  timesSuccessful: number;
  effectiveness: number;
  createdAt: string;
  updatedAt: string;
  source: 'discovered' | 'imported' | 'system';
  isActive: boolean;
  personalNotes?: string;
}

export function MetaSkillsInline() {
  const [metaSkills, setMetaSkills] = useState<MetaSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meta-skill?')) return;

    try {
      await fetch(`/api/meta-skills?id=${id}`, { method: 'DELETE' });
      setMetaSkills(prev => prev.filter(ms => ms.id !== id));
    } catch (error) {
      console.error('Failed to delete meta-skill:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-[#6c5f4e]">Loading meta-skills...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 md:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(120deg,#fffaf0,#f5ebd7)] px-4 py-3 shadow-[0_8px_24px_rgba(110,80,34,0.11)]">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#b35a2f]" />
                <h1 className="lb-display text-2xl font-semibold text-[#2d2114]">Meta-Skills Library</h1>
              </div>
              <p className="text-sm text-[#6f6352]">Universal problem-solving principles that work everywhere</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#d26a3b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f]"
            >
              <Plus className="h-4 w-4" />
              Create Meta-Skill
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Total Skills</p>
              <p className="text-xl font-bold text-[#2f271c]">{metaSkills.length}</p>
            </div>
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Total Applications</p>
              <p className="text-xl font-bold text-[#2f271c]">
                {metaSkills.reduce((sum, ms) => sum + ms.timesApplied, 0)}
              </p>
            </div>
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Success Rate</p>
              <p className="text-xl font-bold text-[#2f271c]">
                {metaSkills.length > 0
                  ? Math.round((metaSkills.reduce((sum, ms) => sum + ms.timesSuccessful, 0) /
                      Math.max(metaSkills.reduce((sum, ms) => sum + ms.timesApplied, 0), 1)) * 100)
                  : 0}%
              </p>
            </div>
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Most Effective</p>
              <p className="truncate text-xs font-semibold text-[#2f271c]">
                {metaSkills[0]?.name || 'None yet'}
              </p>
            </div>
          </div>
        </div>

        {metaSkills.length === 0 ? (
          <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-8 text-center shadow-[0_8px_20px_rgba(95,67,31,0.1)]">
            <Brain className="mx-auto mb-3 h-12 w-12 text-[#c8b495]" />
            <h3 className="mb-1 text-lg font-semibold text-[#2f271c]">No meta-skills yet</h3>
            <p className="mb-4 text-sm text-[#7a6b57]">Create your first meta-skill to start tracking effective strategies</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-[#d26a3b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f]"
            >
              Create Meta-Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {metaSkills.map(skill => (
              <MetaSkillCard key={skill.id} skill={skill} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateMetaSkillModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newSkill) => {
            setMetaSkills(prev => [newSkill, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
