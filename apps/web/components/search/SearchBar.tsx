'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';

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

  const handleClearFilters = () => {
    setFilters({ status: 'all', priority: 'all', depth: 'all' });
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
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

      <SearchFilters
        showFilters={showFilters}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        onClose={() => setShowFilters(false)}
      />

      <SearchResults
        showResults={showResults}
        results={results}
        query={query}
        loading={loading}
        onResultClick={handleResultClick}
      />
    </div>
  );
}
