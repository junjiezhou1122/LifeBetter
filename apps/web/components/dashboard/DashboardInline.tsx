'use client';

import { useEffect, useState } from 'react';
import { DashboardStatsGrid } from './DashboardStatsGrid';
import { DashboardProgress } from './DashboardProgress';
import { RecentActivity } from './RecentActivity';

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Dashboard</h1>
          <p className="text-stone-600">Overview of your tasks and progress</p>
        </div>

        <DashboardStatsGrid stats={stats} />
        <DashboardProgress stats={stats} />
        <RecentActivity recentItems={recentItems} />
      </div>
    </div>
  );
}
