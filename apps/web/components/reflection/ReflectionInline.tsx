'use client';

import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Flame, Calendar, Plus } from 'lucide-react';
import { DailyReflectionForm } from './DailyReflectionForm';
import { ReflectionHistory } from './ReflectionHistory';

interface ReflectionStats {
  currentStreak: number;
  longestStreak: number;
  totalReflections: number;
  reflectedToday: boolean;
}

interface ReflectionItem {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function ReflectionInline() {
  const [stats, setStats] = useState<ReflectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [editingReflection, setEditingReflection] = useState<ReflectionItem | undefined>(undefined);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/reflections/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    fetchStats();
    setEditingReflection(undefined);
    setActiveTab('history');
  };

  const handleEdit = (reflection: ReflectionItem) => {
    setEditingReflection(reflection);
    setActiveTab('today');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-[#6c5f4e]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 md:px-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(120deg,#fffaf0,#f5ebd7)] px-4 py-3 shadow-[0_8px_24px_rgba(110,80,34,0.11)]">
          <div className="mb-1.5 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#b35a2f]" />
            <h1 className="lb-display text-2xl font-semibold text-[#2d2114]">Daily Reflection</h1>
          </div>
          <p className="text-sm text-[#6f6352]">Track your progress, learnings, and growth every day</p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-2.5 md:grid-cols-3">
          <div className="rounded-xl border border-[#e7cda4] bg-[linear-gradient(135deg,#faeed8,#f6dfbe)] p-4">
            <div className="mb-1 flex items-center justify-between">
              <Flame className="h-5 w-5 text-[#b35a2f]" />
              <span className="rounded-full bg-[#f6d8ae] px-1.5 py-0.5 text-[10px] font-semibold text-[#7a4a1e]">
                Current
              </span>
            </div>
            <div className="mb-0.5 text-2xl font-bold text-[#2f271c]">{stats?.currentStreak || 0}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-[#7a6b57]">Day Streak</div>
          </div>

          <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4">
            <div className="mb-1 flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-[#b35a2f]" />
            </div>
            <div className="mb-0.5 text-2xl font-bold text-[#2f271c]">{stats?.longestStreak || 0}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-[#7a6b57]">Longest Streak</div>
          </div>

          <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4">
            <div className="mb-1 flex items-center justify-between">
              <Calendar className="h-5 w-5 text-[#b35a2f]" />
            </div>
            <div className="mb-0.5 text-2xl font-bold text-[#2f271c]">{stats?.totalReflections || 0}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-[#7a6b57]">Total Reflections</div>
          </div>
        </div>

        <div className="mb-4 flex gap-1.5">
          <button
            onClick={() => {
              setActiveTab('today');
              setEditingReflection(undefined);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'today'
                ? 'bg-[#d26a3b] text-white shadow-[0_8px_18px_rgba(95,67,31,0.2)]'
                : 'border border-[#dbc9ad] bg-white/85 text-[#6f6352] hover:bg-[#f9efde]'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Plus className="h-4 w-4" />
              {stats?.reflectedToday && !editingReflection ? 'Update Today' : 'New Reflection'}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-[#d26a3b] text-white shadow-[0_8px_18px_rgba(95,67,31,0.2)]'
                : 'border border-[#dbc9ad] bg-white/85 text-[#6f6352] hover:bg-[#f9efde]'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Calendar className="h-4 w-4" />
              History
            </div>
          </button>
        </div>

        <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_8px_20px_rgba(95,67,31,0.1)]">
          {activeTab === 'today' ? (
            <div>
              {editingReflection && (
                <div className="mb-3 rounded-lg border border-[#e8cb9c] bg-[#faedd8] p-2.5">
                  <p className="text-xs font-medium text-[#7a4a1e]">
                    Editing reflection from {new Date(editingReflection.date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <DailyReflectionForm
                existingReflection={editingReflection}
                onSave={handleSave}
              />
            </div>
          ) : (
            <ReflectionHistory onEdit={handleEdit} />
          )}
        </div>
      </div>
    </div>
  );
}
