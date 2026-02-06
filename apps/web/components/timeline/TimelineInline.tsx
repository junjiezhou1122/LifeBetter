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
        <div className="text-lg text-[#6c5f4e]">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4 md:px-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(120deg,#fffaf0,#f5ebd7)] px-4 py-3 shadow-[0_8px_24px_rgba(110,80,34,0.11)]">
          <div className="mb-1.5 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#b35a2f]" />
            <h1 className="lb-display text-2xl font-semibold text-[#2d2114]">Timeline</h1>
          </div>
          <p className="text-sm text-[#6f6352]">Track all your activity and progress over time</p>
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
          <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-8 text-center shadow-[0_8px_20px_rgba(95,67,31,0.1)]">
            <Clock className="mx-auto mb-3 h-12 w-12 text-[#c8b495]" />
            <h3 className="mb-1 text-lg font-semibold text-[#2f271c]">No activity yet</h3>
            <p className="text-sm text-[#7a6b57]">Start working on items to see your timeline</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTimeline.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f6dfbc]">
                    <Calendar className="h-4 w-4 text-[#a95a2f]" />
                  </div>
                  <h2 className="text-base font-semibold text-[#2f271c]">{group.date}</h2>
                  <div className="h-px flex-1 bg-[#dfcfb4]" />
                </div>

                <div className="ml-4 space-y-3 border-l-2 border-[#dfcfb4] pl-4">
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
