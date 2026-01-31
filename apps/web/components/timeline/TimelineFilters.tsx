import { cn } from '@/lib/utils';

interface TimelineFiltersProps {
  dateRange: string;
  eventTypeFilter: string;
  statusFilter: string;
  onDateRangeChange: (value: string) => void;
  onEventTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export function TimelineFilters({
  dateRange,
  eventTypeFilter,
  statusFilter,
  onDateRangeChange,
  onEventTypeFilterChange,
  onStatusFilterChange
}: TimelineFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Event Type</label>
          <select
            value={eventTypeFilter}
            onChange={(e) => onEventTypeFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="all">All events</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="completed">Completed</option>
            <option value="status_change">Status changes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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
