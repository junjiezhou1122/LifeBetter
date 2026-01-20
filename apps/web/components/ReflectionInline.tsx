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

export function ReflectionInline() {
  const [stats, setStats] = useState<ReflectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [editingReflection, setEditingReflection] = useState<any>(null);

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
    setEditingReflection(null);
    setActiveTab('history');
  };

  const handleEdit = (reflection: any) => {
    setEditingReflection(reflection);
    setActiveTab('today');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-stone-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-stone-900">Daily Reflection</h1>
          </div>
          <p className="text-stone-600">Track your progress, learnings, and growth every day</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Current
              </span>
            </div>
            <div className="text-3xl font-bold text-stone-900 mb-1">{stats?.currentStreak || 0}</div>
            <div className="text-sm text-stone-600">Day Streak</div>
          </div>

          {/* Longest Streak */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-stone-900 mb-1">{stats?.longestStreak || 0}</div>
            <div className="text-sm text-stone-600">Longest Streak</div>
          </div>

          {/* Total Reflections */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-stone-900 mb-1">{stats?.totalReflections || 0}</div>
            <div className="text-sm text-stone-600">Total Reflections</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab('today');
              setEditingReflection(null);
            }}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'today'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              {stats?.reflectedToday && !editingReflection ? 'Update Today' : 'New Reflection'}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              History
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          {activeTab === 'today' ? (
            <div>
              {editingReflection && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
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
