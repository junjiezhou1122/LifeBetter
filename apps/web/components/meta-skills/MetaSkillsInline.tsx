'use client';

import { useState, useEffect } from 'react';
import { Plus, Brain, Search, SlidersHorizontal, Sparkles, Activity } from 'lucide-react';
import { MetaSkillCard } from './MetaSkillCard';
import { CreateMetaSkillModal } from './CreateMetaSkillModal';

interface MetaSkill {
  id: string;
  name: string;
  description: string;
  examples?: string[];
  category?: string;
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
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'effectiveness' | 'usage' | 'recent' | 'name'>('effectiveness');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'discovered' | 'imported' | 'system'>('all');

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

  const getSuccessRate = (skill: MetaSkill) => {
    if (skill.timesApplied <= 0) return 0;
    return Math.round((skill.timesSuccessful / skill.timesApplied) * 100);
  };

  const filteredMetaSkills = metaSkills.filter((skill) => {
    const sourceMatch = sourceFilter === 'all' || skill.source === sourceFilter;
    const q = query.trim().toLowerCase();
    if (!q) return sourceMatch;
    const text = `${skill.name} ${skill.description} ${skill.category || ''}`.toLowerCase();
    return sourceMatch && text.includes(q);
  });

  const sortedMetaSkills = [...filteredMetaSkills].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return b.timesApplied - a.timesApplied;
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'effectiveness':
      default:
        return getSuccessRate(b) - getSuccessRate(a) || b.timesApplied - a.timesApplied;
    }
  });

  const featuredSkill = sortedMetaSkills[0];
  const totalApplications = metaSkills.reduce((sum, ms) => sum + ms.timesApplied, 0);
  const totalSuccesses = metaSkills.reduce((sum, ms) => sum + ms.timesSuccessful, 0);
  const overallSuccessRate = totalApplications > 0 ? Math.round((totalSuccesses / totalApplications) * 100) : 0;
  const activeSkills = metaSkills.filter((ms) => ms.isActive).length;

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
        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(120deg,#fffaf0,#f5ebd7)] px-4 py-3 shadow-[0_8px_24px_rgba(110,80,34,0.11)]">
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

          <div className="rounded-2xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_8px_22px_rgba(95,67,31,0.08)]">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.4fr_0.8fr_1fr]">
              <label className="flex items-center gap-2 rounded-xl border border-[#dac8ab] bg-[#fff8ec] px-2.5 py-2">
                <Search className="h-3.5 w-3.5 text-[#8b7c65]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search strategy, category, notes..."
                  className="w-full bg-transparent text-xs text-[#2f271c] outline-none placeholder:text-[#9b8c75]"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[#dac8ab] bg-[#fff8ec] px-2.5 py-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#8b7c65]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'effectiveness' | 'usage' | 'recent' | 'name')}
                  className="w-full bg-transparent text-xs font-semibold text-[#6d5f4f] outline-none"
                >
                  <option value="effectiveness">Sort: Effectiveness</option>
                  <option value="usage">Sort: Usage</option>
                  <option value="recent">Sort: Recent</option>
                  <option value="name">Sort: Name</option>
                </select>
              </label>

              <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-[#dac8ab] bg-[#fff8ec] p-1">
                {(['all', 'discovered', 'imported', 'system'] as const).map((source) => (
                  <button
                    key={source}
                    onClick={() => setSourceFilter(source)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
                      sourceFilter === source
                        ? 'bg-[#d26a3b] text-white shadow-[0_4px_10px_rgba(210,106,59,0.22)]'
                        : 'text-[#7b6f5d] hover:bg-[#f2e1c7]'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Total Skills</p>
              <p className="text-xl font-bold text-[#2f271c]">{metaSkills.length}</p>
            </div>
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Total Applications</p>
              <p className="text-xl font-bold text-[#2f271c]">{totalApplications}</p>
            </div>
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Success Rate</p>
              <p className="text-xl font-bold text-[#2f271c]">{overallSuccessRate}%</p>
            </div>
            <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a6b57]">Active Skills</p>
              <p className="text-xl font-bold text-[#2f271c]">{activeSkills}</p>
            </div>
          </div>

          {featuredSkill && (
            <div className="grid gap-3 rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(135deg,#fff8ea,#fffef9)] p-4 shadow-[0_10px_24px_rgba(95,67,31,0.1)] md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#b35a2f]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8a5529]">
                    Featured Strategy
                  </span>
                </div>
                <h2 className="lb-display text-xl font-semibold text-[#2f271c]">{featuredSkill.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#6f6352]">{featuredSkill.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#e1d2bb] bg-white/80 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#7a6b57]">Success</p>
                  <p className="text-2xl font-bold text-[#2f7b65]">{getSuccessRate(featuredSkill)}%</p>
                </div>
                <div className="rounded-xl border border-[#e1d2bb] bg-white/80 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#7a6b57]">Applied</p>
                  <p className="text-2xl font-bold text-[#2f271c]">{featuredSkill.timesApplied}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-[#e1d2bb] bg-white/80 p-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#8a5529]" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#7a6b57]">
                      Source: {featuredSkill.source}
                    </p>
                  </div>
                  <p className="text-xs text-[#6f6352]">
                    Last updated {new Date(featuredSkill.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {sortedMetaSkills.length === 0 ? (
          <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-8 text-center shadow-[0_8px_20px_rgba(95,67,31,0.1)]">
            <Brain className="mx-auto mb-3 h-12 w-12 text-[#c8b495]" />
            <h3 className="mb-1 text-lg font-semibold text-[#2f271c]">
              {metaSkills.length === 0 ? 'No meta-skills yet' : 'No results for this filter'}
            </h3>
            <p className="mb-4 text-sm text-[#7a6b57]">
              {metaSkills.length === 0
                ? 'Create your first meta-skill to start tracking effective strategies'
                : 'Try another keyword or source filter.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-[#d26a3b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f]"
            >
              Create Meta-Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sortedMetaSkills.map(skill => (
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
