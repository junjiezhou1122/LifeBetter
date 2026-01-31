import { Target, ChevronRight } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-amber-700" />
          <h3 className="text-sm font-semibold text-stone-900">Today&apos;s Focus</h3>
        </div>
        <p className="text-xs text-stone-600">
          Focus on your top {Math.min(3, priorities.length)} priority items today.
        </p>
      </div>

      <div className="space-y-3">
        {priorities.slice(0, 3).map((item, index) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300"
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-stone-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600">
                  {item.reason}
                </p>
              </div>
            </div>
          </div>
        ))}

        {priorities.length === 0 && (
          <div className="text-center py-8 text-stone-500">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
