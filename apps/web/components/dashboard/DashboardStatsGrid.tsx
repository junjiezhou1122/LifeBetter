import { Target, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalItems: number;
  activeItems: number;
  completedToday: number;
  inProgress: number;
  blocked: number;
  highPriority: number;
  completionRate: number;
}

interface DashboardStatsGridProps {
  stats: DashboardStats | null;
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-stone-900 mb-1">{stats?.totalItems || 0}</div>
        <div className="text-sm text-stone-500">Total Items</div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <Activity className="w-6 h-6 text-amber-500" />
          </div>
        </div>
        <div className="text-2xl font-bold text-stone-900 mb-1">{stats?.activeItems || 0}</div>
        <div className="text-sm text-stone-500">Active Items</div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-stone-900 mb-1">{stats?.completedToday || 0}</div>
        <div className="text-sm text-stone-500">Completed Today</div>
      </div>

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
  );
}
