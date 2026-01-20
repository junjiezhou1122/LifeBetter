import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function getStoragePath(): string {
  const homeDir = os.homedir();
  const storageDir = path.join(homeDir, '.lifebetter');

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  return path.join(storageDir, 'problems.json');
}

function readStorage() {
  const storagePath = getStoragePath();

  try {
    const data = fs.readFileSync(storagePath, 'utf-8');
    const storage = JSON.parse(data);

    if (storage.version === 2 && storage.items) {
      if (!storage.metaSkills) {
        storage.metaSkills = [];
      }
      return storage;
    }

    return { items: [], metaSkills: [], notifications: [], version: 2 };
  } catch (error) {
    return { items: [], metaSkills: [], notifications: [], version: 2 };
  }
}

function searchItems(items: any[], query: string, filters: any) {
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

    const storage = readStorage();
    const items = storage.items || [];

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
