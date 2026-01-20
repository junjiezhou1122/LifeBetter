'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, Edit, Plus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  itemId: string;
  title: string;
  type: 'created' | 'updated' | 'completed' | 'status_change';
  status?: string;
  priority?: string;
  timestamp: string;
  description?: string;
}

interface TimelineGroup {
  date: string;
  items: TimelineItem[];
}

export function TimelineInline() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTimeline();
  }, [dateRange, eventTypeFilter, statusFilter]);

  const fetchTimeline = async () => {
    try {
      const params = new URLSearchParams({
        range: dateRange,
        type: eventTypeFilter,
        status: statusFilter
      });
      const res = await fetch(`/api/timeline?${params}`);
      const data = await res.json();
      setTimeline(data);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (items: TimelineItem[]): TimelineGroup[] => {
    const groups: { [key: string]: TimelineItem[] } = {};

    items.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items: items.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4 text-amber-500" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-stone-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'status_change':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-stone-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-amber-100 border-amber-200';
      case 'updated':
        return 'bg-stone-100 border-stone-200';
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'status_change':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-stone-100 border-stone-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done':
        return 'bg-emerald-100 text-emerald-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      case 'blocked':
        return 'bg-rose-100 text-rose-800';
      case 'todo':
        return 'bg-sky-100 text-sky-800';
      case 'backlog':
        return 'bg-stone-100 text-stone-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const groupedTimeline = groupByDate(timeline);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-stone-600">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-stone-900">Timeline</h1>
          </div>
          <p className="text-stone-600">Track all your activity and progress over time</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Event Type</label>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="all">All events</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="completed">Completed</option>
                <option value="status_change">Status changes</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

        {/* Timeline */}
        {groupedTimeline.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <Clock className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">No activity yet</h3>
            <p className="text-stone-600">Start working on items to see your timeline</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedTimeline.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-stone-900">{group.date}</h2>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                {/* Events */}
                <div className="ml-6 border-l-2 border-stone-200 pl-6 space-y-4">
                  {group.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className={cn(
                        'relative bg-white rounded-lg border p-4 hover:shadow-md transition-all',
                        getEventColor(item.type)
                      )}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[29px] top-5 w-4 h-4 rounded-full bg-white border-2 border-amber-500" />

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center">
                          {getEventIcon(item.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-stone-500 uppercase">
                              {item.type.replace('_', ' ')}
                            </span>
                            {item.status && (
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                getStatusColor(item.status)
                              )}>
                                {item.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-medium text-stone-900 mb-1">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-stone-600 mb-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(item.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
