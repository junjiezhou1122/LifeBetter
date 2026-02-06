import { Search } from 'lucide-react';
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

interface SearchResultsProps {
  showResults: boolean;
  results: SearchResult[];
  query: string;
  loading: boolean;
  onResultClick: (itemId: string) => void;
}

export function SearchResults({
  showResults,
  results,
  query,
  loading,
  onResultClick
}: SearchResultsProps) {
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

  if (!showResults) return null;

  if (results.length === 0 && query && !loading) {
    return (
      <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-[#d8c5a6] bg-[linear-gradient(180deg,#fffdf8,#fff5e8)] p-6 text-center shadow-[0_10px_28px_rgba(101,73,34,0.16)]">
        <Search className="mx-auto mb-2 h-10 w-10 text-[#c6b28f]" />
        <p className="text-sm text-[#7b6f5d]">No results found for &quot;{query}&quot;</p>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="lb-scrollbar absolute top-full z-50 mt-2 max-h-[22rem] w-full overflow-y-auto rounded-xl border border-[#d8c5a6] bg-[linear-gradient(180deg,#fffdf8,#fff5e8)] shadow-[0_12px_30px_rgba(101,73,34,0.16)]">
      <div className="p-2">
        <div className="mb-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#7e725f]">
          {results.length} result{results.length === 1 ? '' : 's'}
        </div>
        {results.map((result) => (
          <button
            key={result.id}
            onClick={() => onResultClick(result.id)}
            className="w-full rounded-lg p-2.5 text-left transition hover:bg-[#f7ecd8]"
          >
            <div className="mb-1 flex items-start gap-2">
              <h3 className="flex-1 text-sm font-semibold text-[#30261a]">
                {result.title}
              </h3>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                getStatusColor(result.status)
              )}>
                {result.status.replace('_', ' ')}
              </span>
            </div>
            {result.description && (
              <p className="mb-1 line-clamp-1 text-xs text-[#6d6150]">
                {result.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-[11px] text-[#7e725f]">
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
  );
}
