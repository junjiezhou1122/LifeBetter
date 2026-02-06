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
    <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dceef6]">
            <Target className="h-[18px] w-[18px] text-[#2f6283]" />
          </div>
        </div>
        <div className="mb-0.5 text-2xl font-bold text-[#2f271c]">{stats?.totalItems || 0}</div>
        <div className="text-xs font-medium uppercase tracking-wide text-[#7c6f5d]">Total Items</div>
      </div>

      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fae7c9]">
            <Activity className="h-[18px] w-[18px] text-[#995f2a]" />
          </div>
        </div>
        <div className="mb-0.5 text-2xl font-bold text-[#2f271c]">{stats?.activeItems || 0}</div>
        <div className="text-xs font-medium uppercase tracking-wide text-[#7c6f5d]">Active Items</div>
      </div>

      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#daefdf]">
            <CheckCircle2 className="h-[18px] w-[18px] text-[#2f7b65]" />
          </div>
        </div>
        <div className="mb-0.5 text-2xl font-bold text-[#2f271c]">{stats?.completedToday || 0}</div>
        <div className="text-xs font-medium uppercase tracking-wide text-[#7c6f5d]">Completed Today</div>
      </div>

      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5deda]">
            <AlertTriangle className="h-[18px] w-[18px] text-[#a14037]" />
          </div>
        </div>
        <div className="mb-0.5 text-2xl font-bold text-[#2f271c]">{stats?.blocked || 0}</div>
        <div className="text-xs font-medium uppercase tracking-wide text-[#7c6f5d]">Blocked Items</div>
      </div>
    </div>
  );
}
