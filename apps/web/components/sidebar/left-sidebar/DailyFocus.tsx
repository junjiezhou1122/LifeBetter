import { Target } from 'lucide-react';

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

interface DailyFocusProps {
  priorities: PriorityItem[];
  onItemClick?: (itemId: string) => void;
}

export function DailyFocus({ priorities, onItemClick }: DailyFocusProps) {
  return (
    <>
      <div className="mb-3 rounded-lg border border-[#e7cda4] bg-[linear-gradient(135deg,#faeed8,#f6dfbe)] p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <Target className="h-4 w-4 text-[#7a4a1e]" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#4a3117]">Today&apos;s Focus</h3>
        </div>
        <p className="text-[11px] text-[#6d5f4f]">
          Focus on your top {Math.min(3, priorities.length)} priority items today.
        </p>
      </div>

      <div className="space-y-2.5">
        {priorities.slice(0, 3).map((item, index) => (
          <div
            key={item.id}
            className="cursor-pointer rounded-lg border border-[#dbc9ad] bg-white/80 p-2.5 transition-shadow hover:border-[#cc9c63] hover:shadow-[0_8px_18px_rgba(95,67,31,0.12)]"
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-start gap-2">
              <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d26a3b] to-[#bb5529] text-[11px] font-bold text-white">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 text-xs font-semibold text-[#34281c]">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#6e604f]">
                  {item.reason}
                </p>
              </div>
            </div>
          </div>
        ))}

        {priorities.length === 0 && (
          <div className="py-7 text-center text-[#7a6b57]">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#d9efe4]">
              <svg className="h-5 w-5 text-[#2f7b65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm">No items to focus on today</p>
          </div>
        )}
      </div>
    </>
  );
}
