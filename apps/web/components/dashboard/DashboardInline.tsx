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
        <div className="text-lg text-[#6c5f4e]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 md:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(120deg,#fffaf0,#f5ebd7)] px-4 py-3 shadow-[0_8px_24px_rgba(110,80,34,0.11)]">
          <h1 className="lb-display text-2xl font-semibold text-[#2d2114]">Dashboard</h1>
          <p className="text-sm text-[#6f6352]">Overview of your tasks and progress</p>
        </div>

        <DashboardStatsGrid stats={stats} />
        <DashboardProgress stats={stats} />
        <RecentActivity recentItems={recentItems} />
      </div>
    </div>
  );
}
