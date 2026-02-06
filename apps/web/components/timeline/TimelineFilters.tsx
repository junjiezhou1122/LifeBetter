interface TimelineFiltersProps {
  dateRange: string;
  eventTypeFilter: string;
  statusFilter: string;
  onDateRangeChange: (value: "all" | "30d" | "7d" | "90d") => void;
  onEventTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export function TimelineFilters({
  dateRange,
  eventTypeFilter,
  statusFilter,
  onDateRangeChange,
  onEventTypeFilterChange,
  onStatusFilterChange,
}: TimelineFiltersProps) {
  return (
    <div className="mb-4 rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) =>
              onDateRangeChange(e.target.value as "all" | "30d" | "7d" | "90d")
            }
            className="lb-input w-full rounded-lg px-2.5 py-1.5 text-xs"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Event Type
          </label>
          <select
            value={eventTypeFilter}
            onChange={(e) => onEventTypeFilterChange(e.target.value)}
            className="lb-input w-full rounded-lg px-2.5 py-1.5 text-xs"
          >
            <option value="all">All events</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="completed">Completed</option>
            <option value="status_change">Status changes</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="lb-input w-full rounded-lg px-2.5 py-1.5 text-xs"
          >
            <option value="all">All statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
}
