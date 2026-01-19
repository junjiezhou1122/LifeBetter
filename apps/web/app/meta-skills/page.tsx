'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Brain } from 'lucide-react';
import Link from 'next/link';

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

export default function MetaSkillsPage() {
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-stone-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">🧠 Meta-Skills Library</h1>
            <p className="text-stone-600">Universal problem-solving principles that work everywhere</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
            >
              Back to Board
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Meta-Skill
            </button>
          </div>
        </div>

        {/* Stats */}
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

      {/* Meta-Skills Grid */}
      <div className="max-w-7xl mx-auto">
        {metaSkills.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <Brain className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">No meta-skills yet</h3>
            <p className="text-stone-600 mb-6">Create your first meta-skill to start tracking effective strategies</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 transition-colors"
            >
              Create Meta-Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metaSkills.map(skill => {
              const effectiveness = skill.timesApplied > 0
                ? Math.round((skill.timesSuccessful / skill.timesApplied) * 100)
                : 0;

              return (
                <div
                  key={skill.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-stone-900 text-base">
                        {skill.name}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {/* TODO: Edit */}}
                        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-stone-600 mb-4 line-clamp-3 leading-relaxed">
                    {skill.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-4 text-xs text-stone-500">
                      <span>{skill.timesApplied} uses</span>
                      <span className={`font-semibold ${
                        effectiveness >= 70 ? 'text-green-600' :
                        effectiveness >= 40 ? 'text-amber-600' :
                        'text-stone-500'
                      }`}>
                        {effectiveness}% success
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
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

// Create Modal Component
function CreateMetaSkillModal({ onClose, onCreated }: { onClose: () => void; onCreated: (skill: MetaSkill) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/meta-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          examples: examples.filter(ex => ex.trim())
        })
      });

      if (res.ok) {
        const newSkill = await res.json();
        onCreated(newSkill);
      }
    } catch (error) {
      console.error('Failed to create meta-skill:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-xl font-semibold text-stone-900">Create Meta-Skill</h2>
            <p className="text-sm text-stone-500 mt-1">A universal problem-solving principle</p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Divide and Conquer, First Principles Thinking"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when and how to use this strategy..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                rows={4}
                required
              />
            </div>

            {/* Examples */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Examples (optional)
              </label>
              {examples.map((example, index) => (
                <input
                  key={index}
                  type="text"
                  value={example}
                  onChange={(e) => {
                    const newExamples = [...examples];
                    newExamples[index] = e.target.value;
                    setExamples(newExamples);
                  }}
                  placeholder={`Example ${index + 1}`}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 mb-2"
                />
              ))}
              <button
                type="button"
                onClick={() => setExamples([...examples, ''])}
                className="text-sm text-stone-600 hover:text-stone-900"
              >
                + Add example
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-stone-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="flex-1 px-4 py-2 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Meta-Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
