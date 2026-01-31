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
  );
}
