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
        <div className="text-xl text-stone-600">Loading meta-skills...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-8 h-8 text-amber-500" />
                <h1 className="text-3xl font-bold text-stone-900">Meta-Skills Library</h1>
              </div>
              <p className="text-stone-600">Universal problem-solving principles that work everywhere</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Meta-Skill
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-stone-200">
              <p className="text-sm text-stone-500 mb-1">Total Skills</p>
              <p className="text-2xl font-bold text-stone-900">{metaSkills.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-200">
              <p className="text-sm text-stone-500 mb-1">Total Applications</p>
              <p className="text-2xl font-bold text-stone-900">
                {metaSkills.reduce((sum, ms) => sum + ms.timesApplied, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-200">
              <p className="text-sm text-stone-500 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-stone-900">
                {metaSkills.length > 0
                  ? Math.round((metaSkills.reduce((sum, ms) => sum + ms.timesSuccessful, 0) /
                      Math.max(metaSkills.reduce((sum, ms) => sum + ms.timesApplied, 0), 1)) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-200">
              <p className="text-sm text-stone-500 mb-1">Most Effective</p>
              <p className="text-sm font-semibold text-stone-900 truncate">
                {metaSkills[0]?.name || 'None yet'}
              </p>
            </div>
          </div>
        </div>

        {metaSkills.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <Brain className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">No meta-skills yet</h3>
            <p className="text-stone-600 mb-6">Create your first meta-skill to start tracking effective strategies</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Create Meta-Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
