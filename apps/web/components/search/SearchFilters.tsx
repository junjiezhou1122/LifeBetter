interface SearchFilterValues {
  status: string;
  priority: string;
  depth: string;
}
interface SearchFiltersProps {
  showFilters: boolean;
  filters: SearchFilterValues;
  onFilterChange: (filters: SearchFilterValues) => void;
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
    <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-[#d8c5a6] bg-[linear-gradient(180deg,#fffdf8,#fff5e8)] p-3 shadow-[0_10px_28px_rgba(101,73,34,0.16)]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="lb-input w-full rounded-lg px-2 py-1.5 text-xs"
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
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className="lb-input w-full rounded-lg px-2 py-1.5 text-xs"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Level
          </label>
          <select
            value={filters.depth}
            onChange={(e) => onFilterChange({ ...filters, depth: e.target.value })}
            className="lb-input w-full rounded-lg px-2 py-1.5 text-xs"
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
        className="mt-3 text-xs font-semibold text-[#8a5529] transition hover:text-[#6d3e19]"
      >
        Clear filters
      </button>
    </div>
  );
}
