'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { TimelineFilters } from './TimelineFilters';
import { TimelineEvent } from './TimelineEvent';

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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-stone-900">Timeline</h1>
          </div>
          <p className="text-stone-600">Track all your activity and progress over time</p>
        </div>

        <TimelineFilters
          dateRange={dateRange}
          eventTypeFilter={eventTypeFilter}
          statusFilter={statusFilter}
          onDateRangeChange={setDateRange}
          onEventTypeFilterChange={setEventTypeFilter}
          onStatusFilterChange={setStatusFilter}
        />

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
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-stone-900">{group.date}</h2>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                <div className="ml-6 border-l-2 border-stone-200 pl-6 space-y-4">
                  {group.items.map((item) => (
                    <TimelineEvent key={item.id} item={item} />
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
