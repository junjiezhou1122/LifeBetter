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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-900">
          Suggested Sub-Items ({tasks.length})
        </h3>
        <button
          onClick={onToggleAll}
          className="text-xs text-stone-700 hover:text-stone-900 font-semibold"
          aria-label={selectedTasks.size === tasks.length ? 'Deselect all items' : 'Select all items'}
        >
          {selectedTasks.size === tasks.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            onClick={() => onToggleTask(index)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedTasks.has(index)
                ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-200'
                : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-sm'
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
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                {selectedTasks.has(index) ? (
                  <CheckSquare className="w-5 h-5 text-amber-500" />
                ) : (
                  <Square className="w-5 h-5 text-stone-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-stone-900 leading-relaxed">{task.title}</h4>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-stone-600 mb-2 leading-relaxed">{task.description}</p>
                )}
                {task.estimatedHours && (
                  <p className="text-xs text-stone-500 font-medium">⏱ {task.estimatedHours}h estimated</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
