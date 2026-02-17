'use client';

import { useState } from 'react';
import { Code, Plus, Sparkles, Search } from 'lucide-react';
import { usePrinciples } from '@/hooks/usePrinciples';
import { PrincipleCard } from './PrincipleCard';
import type { Principle } from '@/lib/types';

export function PrinciplesView() {
  const {
    principles,
    loading,
    createPrinciple,
    updatePrinciple,
    deletePrinciple,
    extractFromExperiences,
  } = usePrinciples();

  const [showCreate, setShowCreate] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newHowToApply, setNewHowToApply] = useState('');
  const [editingPrinciple, setEditingPrinciple] = useState<Principle | null>(null);

  const filtered = principles.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.howToApply.toLowerCase().includes(q) ||
      p.triggers.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleCreate = async () => {
    if (!newName || !newHowToApply) return;
    await createPrinciple({ name: newName, description: newDescription, howToApply: newHowToApply });
    setNewName('');
    setNewDescription('');
    setNewHowToApply('');
    setShowCreate(false);
  };

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const result = await extractFromExperiences();
      const msg = `Extracted ${result.extracted?.length || 0} new skills, refined ${result.refined?.length || 0} existing.`;
      alert(msg);
    } catch {
      alert('Failed to extract principles from experiences.');
    }
    setExtracting(false);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updatePrinciple(id, { isActive });
  };

  const handleEdit = (principle: Principle) => {
    setEditingPrinciple(principle);
    setNewName(principle.name);
    setNewDescription(principle.description);
    setNewHowToApply(principle.howToApply);
    setShowCreate(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPrinciple || !newName || !newHowToApply) return;
    await updatePrinciple(editingPrinciple.id, {
      name: newName,
      description: newDescription,
      howToApply: newHowToApply,
    });
    setEditingPrinciple(null);
    setNewName('');
    setNewDescription('');
    setNewHowToApply('');
    setShowCreate(false);
  };

  const handleDelete = async () => {
    if (!editingPrinciple) return;
    if (confirm(`Delete "${editingPrinciple.name}"?`)) {
      await deletePrinciple(editingPrinciple.id);
      setEditingPrinciple(null);
      setShowCreate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#7b6e5b]">Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden px-4 pb-5 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-[#d26a3b]" />
          <h2 className="text-lg font-bold text-[#2f271c]">Skills / Principles</h2>
          <span className="rounded-full bg-[#f7ead5] px-2 py-0.5 text-xs font-semibold text-[#6c5d47]">
            {principles.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExtract}
            disabled={extracting}
            className="flex items-center gap-1.5 rounded-lg bg-[#f7ead5] px-3 py-1.5 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f2e1c7] disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {extracting ? 'Extracting...' : 'Extract from Experiences'}
          </button>
          <button
            onClick={() => { setEditingPrinciple(null); setShowCreate(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-[#d26a3b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Skill
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b0a28e]" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills..."
          className="w-full rounded-lg border border-[#dbc9ad] bg-white py-2 pl-9 pr-3 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
        />
      </div>

      {/* Create/Edit form */}
      {showCreate && (
        <div className="mb-4 space-y-3 rounded-xl border border-[#dbc9ad] bg-white/90 p-4 shadow-[0_4px_12px_rgba(95,67,31,0.08)]">
          <h3 className="text-sm font-semibold text-[#2f271c]">
            {editingPrinciple ? 'Edit Skill' : 'Create New Skill'}
          </h3>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Always write tests first"
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">Description</label>
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Short description of this skill"
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">
              Agent Instructions (How to Apply)
            </label>
            <textarea
              value={newHowToApply}
              onChange={(e) => setNewHowToApply(e.target.value)}
              placeholder="Step-by-step instructions an AI agent should follow when applying this skill..."
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingPrinciple ? handleSaveEdit : handleCreate}
              disabled={!newName || !newHowToApply}
              className="rounded-lg bg-[#d26a3b] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:bg-[#d5c7b4]"
            >
              {editingPrinciple ? 'Save Changes' : 'Create Skill'}
            </button>
            {editingPrinciple && (
              <button
                onClick={handleDelete}
                className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => {
                setShowCreate(false);
                setEditingPrinciple(null);
                setNewName('');
                setNewDescription('');
                setNewHowToApply('');
              }}
              className="rounded-lg border border-[#dbc9ad] px-4 py-1.5 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f7ead5]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="lb-scrollbar grid gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
        {filtered.map((p) => (
          <PrincipleCard
            key={p.id}
            principle={p}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Code className="mx-auto mb-3 h-8 w-8 text-[#b0a28e]" />
            <p className="text-sm text-[#7b6e5b]">
              {searchQuery ? 'No skills match your search.' : 'No skills yet. Create one or extract from experiences.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
