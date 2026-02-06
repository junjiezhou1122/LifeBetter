import { CheckSquare, Square } from 'lucide-react';

interface SuggestedTask {
  title: string;
  description?: string;
  priority: string;
  estimatedHours?: number;
}

interface TaskListProps {
  tasks: SuggestedTask[];
  selectedTasks: Set<number>;
  onToggleTask: (index: number) => void;
  onToggleAll: () => void;
}

export function TaskList({ tasks, selectedTasks, onToggleTask, onToggleAll }: TaskListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6c5d47]">
          Suggested Sub-Items ({tasks.length})
        </h3>
        <button
          onClick={onToggleAll}
          className="text-[11px] font-semibold text-[#8a5529] transition hover:text-[#6d3e19]"
          aria-label={selectedTasks.size === tasks.length ? 'Deselect all items' : 'Select all items'}
        >
          {selectedTasks.size === tasks.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task, index) => (
          <div
            key={index}
            onClick={() => onToggleTask(index)}
            className={`cursor-pointer rounded-xl border p-3 transition-all ${
              selectedTasks.has(index)
                ? 'border-[#d29a58] bg-[#faedd8] shadow-[0_8px_18px_rgba(95,67,31,0.12)]'
                : 'border-[#dbc9ad] bg-white/85 hover:border-[#cc9c63] hover:shadow-[0_8px_16px_rgba(95,67,31,0.1)]'
            }`}
            role="checkbox"
            aria-checked={selectedTasks.has(index)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleTask(index);
              }
            }}
          >
            <div className="flex items-start gap-2.5">
              <div className="pt-0.5">
                {selectedTasks.has(index) ? (
                  <CheckSquare className="h-[18px] w-[18px] text-[#b35a2f]" />
                ) : (
                  <Square className="h-[18px] w-[18px] text-[#8e7e67]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold leading-relaxed text-[#2f271c]">{task.title}</h4>
                  <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="mb-1.5 text-[11px] leading-relaxed text-[#6f6352]">{task.description}</p>
                )}
                {task.estimatedHours && (
                  <p className="text-[11px] font-medium text-[#7e725f]">⏱ {task.estimatedHours}h estimated</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
