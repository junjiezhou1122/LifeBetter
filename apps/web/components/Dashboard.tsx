'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, Clock, CheckCircle2, AlertCircle, Target, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DashboardStats {
  totalItems: number;
  activeItems: number;
  completedToday: number;
  inProgress: number;
  blocked: number;
  highPriority: number;
  completionRate: number;
  avgCompletionTime: number;
}

interface RecentItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export function Dashboard() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
          </div>
          <p className="text-stone-600">Overview of your progress and activities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Items */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-stone-900">{stats?.totalItems || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-stone-600">Total Items</h3>
            <p className="text-xs text-stone-500 mt-1">All tracked items</p>
          </div>

          {/* Active Items */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-stone-900">{stats?.activeItems || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-stone-600">Active Items</h3>
            <p className="text-xs text-stone-500 mt-1">In progress or pending</p>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-stone-900">{stats?.completedToday || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-stone-600">Completed Today</h3>
            <p className="text-xs text-stone-500 mt-1">Items finished today</p>
          </div>

          {/* Blocked Items */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-stone-900">{stats?.blocked || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-stone-600">Blocked Items</h3>
            <p className="text-xs text-stone-500 mt-1">Need attention</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Completion Rate */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-stone-900">Completion Rate</h2>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-600">Overall Progress</span>
                <span className="text-sm font-medium text-stone-900">
                  {stats?.completionRate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.completionRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
              <div>
                <div className="text-2xl font-bold text-stone-900">{stats?.inProgress || 0}</div>
                <div className="text-xs text-stone-500">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-900">{stats?.highPriority || 0}</div>
                <div className="text-xs text-stone-500">High Priority</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-stone-900">Recent Activity</h2>
              </div>
              <Link
                href="/timeline"
                className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentItems.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                recentItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-stone-500">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      item.status === 'done' && 'bg-green-100 text-green-700',
                      item.status === 'in_progress' && 'bg-amber-100 text-amber-700',
                      item.status === 'blocked' && 'bg-red-100 text-red-700',
                      item.status === 'todo' && 'bg-blue-100 text-blue-700',
                      item.status === 'backlog' && 'bg-stone-100 text-stone-700'
                    )}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 p-4 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <Target className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-sm font-medium text-stone-900">View Board</div>
                <div className="text-xs text-stone-500">Manage your items</div>
              </div>
            </Link>

            <Link
              href="/timeline"
              className="flex items-center gap-3 p-4 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-sm font-medium text-stone-900">Timeline</div>
                <div className="text-xs text-stone-500">View activity history</div>
              </div>
            </Link>

            <Link
              href="/meta-skills"
              className="flex items-center gap-3 p-4 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <div>
                <div className="text-sm font-medium text-stone-900">Meta-Skills</div>
                <div className="text-xs text-stone-500">Browse skills library</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
