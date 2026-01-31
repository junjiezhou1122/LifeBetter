import { NextResponse } from 'next/server';
import { readStorage } from '@/lib/server/storage';
import type { Item, ItemStatus } from '@/lib/types';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: string;
  type: 'created' | 'updated' | 'completed' | 'status_change';
  timestamp: string;
  depth: number;
  tags?: string[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('type') || 'all';
    const filterStatus = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('range') || '30d';

    const storage = await readStorage();
    const items = storage.items;

    // Convert items to timeline events
    const timelineItems: TimelineItem[] = [];

    items.forEach((item: Item) => {
      // Created event
      timelineItems.push({
        id: `${item.id}-created`,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        type: 'created',
        timestamp: item.createdAt,
        depth: item.depth,
        tags: item.tags
      });

      // Updated event (if different from created)
      if (item.updatedAt !== item.createdAt) {
        timelineItems.push({
          id: `${item.id}-updated`,
          title: item.title,
          description: item.description,
          status: item.status,
          priority: item.priority,
          type: 'updated',
          timestamp: item.updatedAt,
          depth: item.depth,
          tags: item.tags
        });
      }

      // Completed event (if status is done)
      if (item.status === 'done') {
        timelineItems.push({
          id: `${item.id}-completed`,
          title: item.title,
          description: item.description,
          status: item.status,
          priority: item.priority,
          type: 'completed',
          timestamp: item.updatedAt,
          depth: item.depth,
          tags: item.tags
        });
      }
    });

    // Filter by type
    let filteredItems = timelineItems;
    if (filterType !== 'all') {
      filteredItems = filteredItems.filter(item => item.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filteredItems = filteredItems.filter(item => item.status === filterStatus);
    }

    // Filter by date range
    const now = Date.now();
    const ranges: { [key: string]: number } = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const rangeMs = ranges[dateRange] || ranges['30d'];
    filteredItems = filteredItems.filter(item => {
      const itemTime = new Date(item.timestamp).getTime();
      return now - itemTime <= rangeMs;
    });

    // Sort by timestamp (newest first)
    filteredItems.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
