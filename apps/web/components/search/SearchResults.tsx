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
      <div className="absolute top-full mt-2 w-full bg-white border border-stone-200 rounded-lg shadow-lg p-8 text-center z-50">
        <Search className="w-12 h-12 mx-auto mb-2 text-stone-300" />
        <p className="text-sm text-stone-500">No results found for "{query}"</p>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="absolute top-full mt-2 w-full bg-white border border-stone-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
      <div className="p-2">
        <div className="text-xs text-stone-500 px-2 py-1 mb-1">
          {results.length} result{results.length === 1 ? '' : 's'}
        </div>
        {results.map((result) => (
          <button
            key={result.id}
            onClick={() => onResultClick(result.id)}
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
  );
}
