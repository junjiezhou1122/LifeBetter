import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  showFilters: boolean;
  filters: {
    status: string;
    priority: string;
    depth: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function SearchFilters({
  showFilters,
  filters,
  onFilterChange,
  onClearFilters,
  onClose
}: SearchFiltersProps) {
  if (!showFilters) return null;

  return (
    <div className="absolute top-full mt-2 w-full bg-white border border-stone-200 rounded-lg shadow-lg p-4 z-50">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-2">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-2">Level</label>
          <select
            value={filters.depth}
            onChange={(e) => onFilterChange({ ...filters, depth: e.target.value })}
            className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All</option>
            <option value="0">Level 0</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => {
          onClearFilters();
          onClose();
        }}
        className="mt-3 text-xs text-amber-700 hover:text-amber-800 font-medium"
      >
        Clear filters
      </button>
    </div>
  );
}
