'use client';

import { useEffect, useState } from 'react';
import { Target, CheckCircle2, Clock, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface DashboardStats {
  totalItems: number;
  activeItems: number;
  completedToday: number;
  inProgress: number;
  blocked: number;
  highPriority: number;
  completionRate: number;
}

interface RecentItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export function DashboardInline() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      setStats(data.stats);
      setRecentItems(data.recentItems);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-emerald-100 text-emerald-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      case 'blocked':
        return 'bg-rose-100 text-rose-800';
      case 'todo':
        return 'bg-sky-100 text-sky-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-stone-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Dashboard</h1>
          <p className="text-stone-600">Overview of your tasks and progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Items */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 mb-1">{stats?.totalItems || 0}</div>
            <div className="text-sm text-stone-500">Total Items</div>
          </div>

          {/* Active Items */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 mb-1">{stats?.activeItems || 0}</div>
            <div className="text-sm text-stone-500">Active Items</div>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 mb-1">{stats?.completedToday || 0}</div>
            <div className="text-sm text-stone-500">Completed Today</div>
          </div>

          {/* Blocked Items */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 mb-1">{stats?.blocked || 0}</div>
            <div className="text-sm text-stone-500">Blocked Items</div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Completion Rate */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Completion Rate</h3>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-stone-900">
                  {Math.round(stats?.completionRate || 0)}%
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.completionRate || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">In Progress</span>
                <span className="text-sm font-semibold text-stone-900">{stats?.inProgress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">High Priority</span>
                <span className="text-sm font-semibold text-stone-900">{stats?.highPriority || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Blocked</span>
                <span className="text-sm font-semibold text-stone-900">{stats?.blocked || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-900">Recent Activity</h3>
            <Clock className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-3">
            {recentItems.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-8">No recent activity</p>
            ) : (
              recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{item.title}</p>
                    <p className="text-xs text-stone-500">
                      {new Date(item.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
