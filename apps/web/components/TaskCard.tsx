'use client';

import { AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  problemId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  blockedBy?: string[];
  blocking?: string[];
  canBreakdown?: boolean;
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const PRIORITY_COLORS = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const PRIORITY_ICONS = {
  urgent: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColor = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  const priorityIcon = PRIORITY_ICONS[task.priority as keyof typeof PRIORITY_ICONS] || PRIORITY_ICONS.medium;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Priority indicator */}
      <div className={cn('h-1 rounded-t-lg', priorityColor)} />

      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-lg">{priorityIcon}</span>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {task.title}
            </p>
          </div>
          {task.canBreakdown !== false && (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Blocking indicators */}
        {(task.blockedBy && task.blockedBy.length > 0) && (
          <div className="flex items-center gap-1 text-xs text-red-600 mt-2">
            <AlertCircle className="w-3 h-3" />
            <span>Blocked by {task.blockedBy.length} item(s)</span>
          </div>
        )}

        {(task.blocking && task.blocking.length > 0) && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 mt-2">
            <AlertCircle className="w-3 h-3" />
            <span>Blocking {task.blocking.length} item(s)</span>
          </div>
        )}
      </div>
    </div>
  );
}
