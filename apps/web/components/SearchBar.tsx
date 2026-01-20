'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  depth: number;
  tags?: string[];
  updatedAt: string;
}

interface SearchBarProps {
  onResultClick?: (itemId: string) => void;
}

export function SearchBar({ onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    depth: 'all'
  });

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() || filters.status !== 'all' || filters.priority !== 'all' || filters.depth !== 'all') {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        status: filters.status,
        priority: filters.priority,
        depth: filters.depth
      });

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (itemId: string) => {
    onResultClick?.(itemId);
    setShowResults(false);
    setQuery('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      case 'todo':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder="Search items..."
          className="w-full pl-10 pr-20 py-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showFilters || filters.status !== 'all' || filters.priority !== 'all' || filters.depth !== 'all'
                ? 'bg-amber-100 text-amber-700'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            )}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Dropdown */}
      {showFilters && (
        <div className="absolute top-full mt-2 w-full bg-white border border-stone-200 rounded-lg shadow-lg p-4 z-50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <label className="block text-xs font-medium text-stone-600 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">Level</label>
              <select
                value={filters.depth}
                onChange={(e) => setFilters({ ...filters, depth: e.target.value })}
                className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              setFilters({ status: 'all', priority: 'all', depth: 'all' });
              setShowFilters(false);
            }}
            className="mt-3 text-xs text-amber-700 hover:text-amber-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-stone-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs text-stone-500 px-2 py-1 mb-1">
              {results.length} result{results.length === 1 ? '' : 's'}
            </div>
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className="w-full text-left p-3 hover:bg-stone-50 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="text-sm font-medium text-stone-900 flex-1">
                    {result.title}
                  </h3>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    getStatusColor(result.status)
                  )}>
                    {result.status.replace('_', ' ')}
                  </span>
                </div>
                {result.description && (
                  <p className="text-xs text-stone-600 line-clamp-1 mb-1">
                    {result.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span>Level {result.depth}</span>
                  <span>•</span>
                  <span className="capitalize">{result.priority}</span>
                  {result.tags && result.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{result.tags.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && results.length === 0 && query && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white border border-stone-200 rounded-lg shadow-lg p-8 text-center z-50">
          <Search className="w-12 h-12 mx-auto mb-2 text-stone-300" />
          <p className="text-sm text-stone-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
