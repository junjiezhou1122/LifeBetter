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
    <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fae7c9]">
            <TrendingUp className="h-4 w-4 text-[#995f2a]" />
          </div>
          <h3 className="text-base font-semibold text-[#2e2418]">Completion Rate</h3>
        </div>
        <div className="mb-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-2xl font-bold text-[#2f271c]">
              {Math.round(stats?.completionRate || 0)}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#eadfc9]">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-[#d26a3b] to-[#bb5529] transition-all duration-500"
              style={{ width: `${stats?.completionRate || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <h3 className="mb-3 text-base font-semibold text-[#2e2418]">Quick Stats</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6f6352]">In Progress</span>
            <span className="text-sm font-semibold text-[#2f271c]">{stats?.inProgress || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6f6352]">High Priority</span>
            <span className="text-sm font-semibold text-[#2f271c]">{stats?.highPriority || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6f6352]">Blocked</span>
            <span className="text-sm font-semibold text-[#2f271c]">{stats?.blocked || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
