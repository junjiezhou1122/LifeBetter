import { NextResponse } from 'next/server';
import { readStorage } from '@/lib/server/storage';
import type { Item } from '@/lib/types';

function searchItems(items: Item[], query: string, filters: {
  status: string;
  priority: string;
  depth: string;
  tags: string[];
}) {
  let results = items;

  // Keyword search
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase();
      results = results.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
        const descMatch = item.description?.toLowerCase().includes(lowerQuery);
        const tagsMatch = item.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery));
        return titleMatch || descMatch || tagsMatch;
      });
    }

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    results = results.filter(item => item.status === filters.status);
  }

  // Filter by priority
  if (filters.priority && filters.priority !== 'all') {
    results = results.filter(item => item.priority === filters.priority);
  }

  // Filter by depth
  if (filters.depth !== undefined && filters.depth !== 'all') {
    results = results.filter(item => item.depth === parseInt(filters.depth));
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(item =>
      filters.tags.some((tag: string) => item.tags?.includes(tag))
    );
  }

  return results;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const depth = searchParams.get('depth') || 'all';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    const storage = await readStorage();
    const items = storage.items;

    const filters = { status, priority, depth, tags };
    const results = searchItems(items, query, filters);

    // Sort by relevance (items with query in title first, then by updated date)
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase();
      results.sort((a, b) => {
        const aTitle = a.title?.toLowerCase().includes(lowerQuery);
        const bTitle = b.title?.toLowerCase().includes(lowerQuery);

        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    } else {
      // Sort by updated date
      results.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return NextResponse.json({
      results,
      total: results.length,
      query
    });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
