import { TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalItems: number;
  activeItems: number;
  completedToday: number;
  inProgress: number;
  blocked: number;
  highPriority: number;
  completionRate: number;
}

interface DashboardProgressProps {
  stats: DashboardStats | null;
}

export function DashboardProgress({ stats }: DashboardProgressProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
  );
}
