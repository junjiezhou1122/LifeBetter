import { cn } from '@/lib/utils';

interface PriorityItem {
  id: string;
  title: string;
  priority: string;
  status: string;
  score: number;
  reason: string;
  age: number;
  blockedBy?: string[];
  blocking?: string[];
}

interface PriorityListProps {
  priorities: PriorityItem[];
  loading: boolean;
  onItemClick?: (itemId: string) => void;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'medium':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'low':
      return 'text-stone-600 bg-stone-50 border-stone-200';
    default:
      return 'text-stone-600 bg-stone-50 border-stone-200';
  }
}

export function PriorityList({ priorities, loading, onItemClick }: PriorityListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-stone-500">Loading...</div>
      </div>
    );
  }

  if (priorities.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm">All caught up! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {priorities.slice(0, 10).map((item, index) => (
        <div
          key={item.id}
          className="bg-white border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300"
          onClick={() => onItemClick?.(item.id)}
        >
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-stone-900 line-clamp-2">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full border font-medium',
              getPriorityColor(item.priority)
            )}>
              {item.priority}
            </span>
            <span className="text-xs text-stone-500">
              {item.age}d old
            </span>
          </div>

          <p className="text-xs text-stone-600">
            {item.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
