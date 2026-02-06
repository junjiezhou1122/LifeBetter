import { Clock } from 'lucide-react';

interface RecentItem {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

interface RecentActivityProps {
  recentItems: RecentItem[];
}

export function RecentActivity({ recentItems }: RecentActivityProps) {
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

  return (
    <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#2e2418]">Recent Activity</h3>
        <Clock className="h-4 w-4 text-[#897b66]" />
      </div>
      <div className="space-y-2">
        {recentItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#7a6b57]">No recent activity</p>
        ) : (
          recentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-[#e6d7c0] bg-[#fffaf1] p-2.5 transition-colors hover:bg-[#f8eddc]"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-[#2f271c]">{item.title}</p>
                <p className="text-[11px] text-[#7e725f]">
                  {new Date(item.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusColor(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
