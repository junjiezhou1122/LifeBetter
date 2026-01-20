'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Filter, ChevronDown, Circle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: 'created' | 'updated' | 'completed' | 'status_change';
  timestamp: string;
  depth: number;
  tags?: string[];
}

interface TimelineGroup {
  date: string;
  items: TimelineItem[];
}

export function Timeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'created' | 'updated' | 'completed'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchTimeline();
  }, [filterType, filterStatus, dateRange]);

  const fetchTimeline = async () => {
    try {
      const params = new URLSearchParams({
        type: filterType,
        status: filterStatus,
        range: dateRange
      });

      const res = await fetch(`/api/timeline?${params}`);
      const data = await res.json();
      setItems(data);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'todo':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'created':
        return <Circle className="w-4 h-4 text-blue-600" />;
      case 'status_change':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-stone-600" />;
    }
  };

  const timelineGroups = groupByDate(items);

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-stone-900">Timeline</h1>
          </div>
          <p className="text-stone-600">View all your activities in chronological order</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-stone-600" />
            <span className="text-sm font-medium text-stone-700">Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">Event Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All events</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-stone-500">Loading timeline...</div>
          </div>
        ) : timelineGroups.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500">No activities found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {timelineGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-500"></div>
                  <h2 className="text-lg font-semibold text-stone-900">{group.date}</h2>
                  <div className="flex-1 h-px bg-stone-200"></div>
                </div>

                {/* Timeline Items */}
                <div className="ml-1 border-l-2 border-stone-200 pl-8 space-y-4">
                  {group.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="relative bg-white rounded-lg border border-stone-200 p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      </div>

                      {/* Content */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(item.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-stone-900 mb-1">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-sm text-stone-600 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-full border font-medium',
                              getStatusColor(item.status)
                            )}>
                              {item.status.replace('_', ' ')}
                            </span>

                            <span className="text-xs text-stone-500">
                              {new Date(item.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            {item.depth > 0 && (
                              <span className="text-xs text-stone-500">
                                Level {item.depth}
                              </span>
                            )}

                            {item.tags && item.tags.length > 0 && (
                              <div className="flex gap-1">
                                {item.tags.slice(0, 3).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
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
