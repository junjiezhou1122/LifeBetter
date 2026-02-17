'use client';

import { useState } from 'react';
import { BookOpen, Plus, Trash2, Loader2 } from 'lucide-react';
import { useExperiences } from '@/hooks/useExperiences';
import type { Item } from '@/lib/types';

interface ItemExperienceContentProps {
  item: Item;
}

export function ItemExperienceContent({ item }: ItemExperienceContentProps) {
  const { experiences, loading, createExperience, updateExperience } = useExperiences(item.id);
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    await createExperience(item.id, newContent.trim());
    setNewContent('');
    setSaving(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;
    await updateExperience(id, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-[#6c5d47]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-[#6c5d47]" />
        <h3 className="text-sm font-semibold text-[#2f271c]">Experience Log</h3>
        <span className="text-[10px] text-[#8e7e67]">(markdown, for AI)</span>
      </div>

      {/* New experience input */}
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={"# Experience\n\n## Outcome\nsuccess / partial / failure\n\n## What worked\n...\n\n## What failed\n...\n\n## Key insight\n..."}
          className="w-full rounded-lg border border-[#dbc9ad] bg-[#faf6ef] px-3 py-2 font-mono text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
          rows={6}
        />
        <button
          onClick={handleCreate}
          disabled={saving || !newContent.trim()}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#d26a3b] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#bb5a2f] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Add Experience
        </button>
      </div>

      {/* Experience list */}
      {experiences.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#dbc9ad] p-4 text-center">
          <p className="text-xs text-[#7b6e5b]">No experiences recorded yet.</p>
          <p className="text-[11px] text-[#b0a28e]">AI agents will auto-record experiences here after task completion.</p>
        </div>
      )}

      {experiences.map((exp) => (
        <div key={exp.id} className="rounded-xl border border-[#dbc9ad] bg-[#faf6ef] p-3">
          {editingId === exp.id ? (
            <>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 font-mono text-xs text-[#2f271c] focus:border-[#d26a3b] focus:outline-none"
                rows={6}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleUpdate(exp.id)}
                  className="rounded-lg bg-[#2f7b65] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#1f5b47]"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-[#dbc9ad] px-3 py-1 text-[11px] font-semibold text-[#6c5d47] hover:bg-[#f7ead5]"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <pre className="whitespace-pre-wrap font-mono text-xs text-[#2f271c] leading-relaxed">
                {exp.content}
              </pre>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[#8e7e67]">
                  {new Date(exp.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={() => { setEditingId(exp.id); setEditContent(exp.content); }}
                  className="text-[10px] font-medium text-[#6c5d47] hover:text-[#d26a3b]"
                >
                  Edit
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
