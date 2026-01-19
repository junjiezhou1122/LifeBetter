'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Problem {
  id: string;
  text: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  breakdownStatus?: string;
  tags?: string[];
  blockedBy?: string[];
  blocking?: string[];
}

interface Task {
  id: string;
  problemId: string;
  title: string;
  status: string;
  priority: string;
}

interface ProblemCardProps {
  problem: Problem;
  tasks: Task[];
  onBreakdown?: () => void;
  onDelete?: () => void;
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

export function ProblemCard({ problem, tasks, onBreakdown, onDelete }: ProblemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const priorityColor = PRIORITY_COLORS[problem.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  const priorityIcon = PRIORITY_ICONS[problem.priority as keyof typeof PRIORITY_ICONS] || PRIORITY_ICONS.medium;

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;

  const handleBreakdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBreakdown?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this problem and all its tasks?')) {
      onDelete?.();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Priority indicator */}
      <div className={cn('h-1 rounded-t-lg', priorityColor)} />

      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-lg">{priorityIcon}</span>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {problem.text}
            </p>
          </div>
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              title="Delete problem"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
          {problem.tags && problem.tags.length > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-600">{problem.tags[0]}</span>
            </>
          )}
        </div>

        {/* Blocking indicators */}
        {(problem.blockedBy && problem.blockedBy.length > 0) && (
          <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
            <AlertCircle className="w-3 h-3" />
            <span>Blocked by {problem.blockedBy.length} item(s)</span>
          </div>
        )}

        {(problem.blocking && problem.blocking.length > 0) && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 mb-2">
            <AlertCircle className="w-3 h-3" />
            <span>Blocking {problem.blocking.length} item(s)</span>
          </div>
        )}

        {/* Tasks summary */}
        {totalTasks > 0 ? (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-xs text-gray-600 hover:text-gray-900"
            >
              <div className="flex items-center gap-2">
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="font-medium">
                  {completedTasks}/{totalTasks} tasks
                </span>
              </div>
              <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </button>

            {/* Expanded tasks */}
            {expanded && (
              <div className="mt-2 space-y-1">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-gray-50"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-3 h-3 border border-gray-300 rounded flex-shrink-0" />
                    )}
                    <span className={cn(
                      'flex-1 line-clamp-1',
                      task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={handleBreakdownClick}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Breakdown</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
