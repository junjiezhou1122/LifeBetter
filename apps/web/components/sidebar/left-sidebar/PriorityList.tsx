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
      return 'text-[#9d3c33] bg-[#f9e9e7] border-[#edc3bd]';
    case 'medium':
      return 'text-[#8a5b26] bg-[#faefdc] border-[#eed3ad]';
    case 'low':
      return 'text-[#2f7b65] bg-[#e9f5ef] border-[#b8ddcb]';
    default:
      return 'text-[#6d5f4f] bg-[#f8f2e8] border-[#dfcfb4]';
  }
}

export function PriorityList({ priorities, loading, onItemClick }: PriorityListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-[#7a6b57]">Loading...</div>
      </div>
    );
  }

  if (priorities.length === 0) {
    return (
      <div className="py-7 text-center text-[#7a6b57]">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#d9efe4]">
          <svg className="h-5 w-5 text-[#2f7b65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {priorities.slice(0, 10).map((item, index) => (
        <div
          key={item.id}
          className="cursor-pointer rounded-lg border border-[#dbc9ad] bg-white/80 p-2.5 transition-shadow hover:border-[#cc9c63] hover:shadow-[0_8px_18px_rgba(95,67,31,0.12)]"
          onClick={() => onItemClick?.(item.id)}
        >
          <div className="mb-1.5 flex items-start gap-2">
            <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#f4dab4] text-[11px] font-bold text-[#7d4d22]">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-2 text-xs font-semibold text-[#34281c]">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="mb-1.5 flex items-center gap-1.5">
            <span className={cn(
              'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
              getPriorityColor(item.priority)
            )}>
              {item.priority}
            </span>
            <span className="text-[10px] text-[#7f725e]">
              {item.age}d old
            </span>
          </div>

          <p className="text-[11px] text-[#6e604f]">
            {item.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
