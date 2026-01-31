'use client';

import { Sparkles, Trash2, ChevronRight, AlertCircle } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description?: string;
  parentId: string | null;
  depth: number;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  breakdownStatus?: string;
  tags?: string[];
  blockedBy?: string[];
  blocking?: string[];
  canBreakdown?: boolean;
  order: number;
}

interface ItemCardProps {
  item: Item;
  childCount: number;
  onClick: () => void;
  onDrillDown?: () => void;
  onBreakdown: () => void;
  onDelete: () => void;
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500'
};

const priorityDots: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500'
};

export function ItemCard({ item, childCount, onClick, onDrillDown, onBreakdown, onDelete }: ItemCardProps) {
  const hasChildren = childCount > 0;
  const isBlocked = (item.blockedBy?.length || 0) > 0;
  const isBlocking = (item.blocking?.length || 0) > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick();
  };

  const handleChildrenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDrillDown) {
      onDrillDown();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${item.title}"${hasChildren ? ` and all ${childCount} sub-items` : ''}?`)) {
      onDelete();
    }
  };

  const handleBreakdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBreakdown();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      {/* Title and Child Count */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-medium text-stone-900 flex-1 line-clamp-2 leading-relaxed">
          {item.title}
        </h3>
        {hasChildren && (
          <button
            onClick={handleChildrenClick}
            className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md shrink-0 hover:bg-stone-200 hover:text-stone-700 transition-colors"
            title="View sub-items"
          >
            <ChevronRight className="w-3 h-3" />
            <span>{childCount}</span>
          </button>
        )}
      </div>

      {/* Description (if exists) */}
      {item.description && (
        <p className="text-xs text-stone-600 mb-3 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
          {item.description}
        </p>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Blocking/Blocked Indicators */}
      {(isBlocked || isBlocking) && (
        <div className="space-y-1.5 mb-3">
          {isBlocked && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md">
              <AlertCircle className="w-3 h-3" />
              <span>Blocked by {item.blockedBy!.length}</span>
            </div>
          )}
          {isBlocking && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              <AlertCircle className="w-3 h-3" />
              <span>Blocking {item.blocking!.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${priorityDots[item.priority]}`} />
          <span className="text-xs text-stone-500 capitalize">{item.priority}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* AI Breakdown Button */}
          <button
            onClick={handleBreakdown}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
            title="AI Breakdown"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
