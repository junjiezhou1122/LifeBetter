'use client';

import { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle } from 'lucide-react';

interface Reflection {
  id?: string;
  date: string;
  content: string;
}

interface DailyReflectionFormProps {
  existingReflection?: Reflection;
  onSave?: () => void;
}

export function DailyReflectionForm({ existingReflection, onSave }: DailyReflectionFormProps) {
  const [formData, setFormData] = useState<Reflection>({
    date: new Date().toISOString().split('T')[0],
    content: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existingReflection) {
      setFormData(existingReflection);
    }
  }, [existingReflection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const method = existingReflection ? 'PATCH' : 'POST';
      const url = existingReflection
        ? `/api/reflections?id=${existingReflection.id}`
        : '/api/reflections';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          onSave?.();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          <Calendar className="mr-1 inline h-3.5 w-3.5" />
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="lb-input w-full rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
          Daily Reflection *
        </label>
        <div className="mb-2 text-[11px] text-[#7b6f5d]">
          Supports Markdown: **bold**, *italic*, # headings, - lists, etc.
        </div>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="# Today's Reflection

## What I accomplished
-

## Challenges I faced
-

## What I learned
-

## Tomorrow's plan
- "
          className="lb-input min-h-[280px] w-full rounded-lg px-3 py-2.5 font-mono text-xs"
          required
        />
      </div>

      <button
        type="submit"
        disabled={saving || saved}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all ${
          saved
            ? 'bg-[#2f7b65] text-white'
            : 'bg-gradient-to-r from-[#d26a3b] to-[#bb5529] text-white shadow-[0_8px_18px_rgba(95,67,31,0.2)] hover:from-[#bf5f33] hover:to-[#a94a22]'
        }`}
      >
        {saved ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Saved!
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Reflection'}
          </>
        )}
      </button>
    </form>
  );
}
