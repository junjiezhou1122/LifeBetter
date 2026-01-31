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
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
      </div>

      {/* Markdown Content */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          Daily Reflection *
        </label>
        <div className="mb-2 text-xs text-stone-500">
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
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[400px] font-mono text-sm"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={saving || saved}
        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
        }`}
      >
        {saved ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Saved!
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Reflection'}
          </>
        )}
      </button>
    </form>
  );
}
