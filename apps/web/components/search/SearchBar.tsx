'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  className?: string;
}

export function SearchBar({ onResultClick, className = '' }: SearchBarProps) {
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

  const performSearch = useCallback(async () => {
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
  }, [query, filters]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (
        query.trim() ||
        filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.depth !== 'all'
      ) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, filters, performSearch]);

  const handleResultClick = (itemId: string) => {
    onResultClick?.(itemId);
    setShowResults(false);
    setQuery('');
  };

  const handleClearFilters = () => {
    setFilters({ status: 'all', priority: 'all', depth: 'all' });
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-xl ${className}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8b7c65]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          placeholder="Search items..."
          className="lb-input w-full rounded-xl py-2 pl-8 pr-[4.5rem] text-[13px] shadow-[0_5px_14px_rgba(101,77,42,0.1)]"
        />

        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8b7c65]" />}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              showFilters || filters.status !== 'all' || filters.priority !== 'all' || filters.depth !== 'all'
                ? 'bg-[#f4dab4] text-[#7b4b22]'
                : 'text-[#8b7c65] hover:text-[#6f624f] hover:bg-[#f6ead6]'
            )}
            title="Filters"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className="rounded-md p-1.5 text-[#8b7c65] transition-colors hover:bg-[#f6ead6] hover:text-[#6f624f]"
            >
              <X className="h-3.5 w-3.5" />
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
