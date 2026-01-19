'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Target, AlertCircle, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanData {
  todaysPlan: any[];
  highPriority: any[];
  blocked: any[];
  blockingOthers: any[];
  suggestions: string[];
  stats: {
    total: number;
    done: number;
    inProgress: number;
    blocked: number;
  };
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plan');
      const data = await res.json();
      setPlanData(data);
    } catch (error) {
      console.error('Failed to fetch plan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlan();
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchPlan, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto border-r border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h2 className="text-lg font-bold">Today's Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={fetchPlan}
          disabled={loading}
          className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh Plan
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats */}
        {planData?.stats && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-700">{planData.stats.total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Done</p>
              <p className="text-2xl font-bold text-green-700">{planData.stats.done}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-yellow-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-700">{planData.stats.inProgress}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-600 font-medium">Blocked</p>
              <p className="text-2xl font-bold text-red-700">{planData.stats.blocked}</p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {planData?.suggestions && planData.suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights
            </h3>
            {planData.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-700"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* Today's Plan */}
        {planData?.todaysPlan && planData.todaysPlan.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Focus Today ({planData.todaysPlan.length})
            </h3>
            {planData.todaysPlan.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getPriorityIcon(item.priority)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.text || item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type} • {item.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blocking Others */}
        {planData?.blockingOthers && planData.blockingOthers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Blocking Others ({planData.blockingOthers.length})
            </h3>
            {planData.blockingOthers.map((item) => (
              <div
                key={item.id}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.text || item.title}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Blocking {item.blocking.length} item(s)
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Blocked Items */}
        {planData?.blocked && planData.blocked.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Blocked ({planData.blocked.length})
            </h3>
            {planData.blocked.map((item) => (
              <div
                key={item.id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {item.text || item.title}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Blocked by {item.blockedBy?.length || 0} item(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    urgent: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  };
  return icons[priority] || '🟡';
}
