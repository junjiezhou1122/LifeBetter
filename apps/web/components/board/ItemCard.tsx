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

const priorityDots: Record<string, string> = {
  urgent: 'bg-[#b73b30]',
  high: 'bg-[#cf6b35]',
  medium: 'bg-[#cc8e2e]',
  low: 'bg-[#2f7b65]'
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
      className="group cursor-pointer rounded-xl border border-[#d5c3a5] bg-[linear-gradient(180deg,#fffefb,#fff8ed)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(95,67,31,0.12)]"
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h3 className="flex-1 line-clamp-2 text-[13px] font-semibold leading-snug text-[#33281c]">
          {item.title}
        </h3>
        {hasChildren && (
          <button
            onClick={handleChildrenClick}
            className="flex shrink-0 items-center gap-1 rounded-md border border-[#d6c4a7] bg-white/80 px-1.5 py-0.5 text-[11px] text-[#6f614f] transition-colors hover:bg-white hover:text-[#514530]"
            title="View sub-items"
          >
            <ChevronRight className="h-3 w-3" />
            <span>{childCount}</span>
          </button>
        )}
      </div>

      {item.description && (
        <p className="mb-2 line-clamp-2 text-[11.5px] leading-relaxed text-[#6b5f50]">
          {item.description}
        </p>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-md border border-[#dfcfb4] bg-[#fdf2e3] px-1.5 py-0.5 text-[10px] font-medium text-[#705a3f]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {(isBlocked || isBlocking) && (
        <div className="mb-2 space-y-1">
          {isBlocked && (
            <div className="flex items-center gap-1 rounded-md border border-[#efc8c2] bg-[#fbebe9] px-1.5 py-0.5 text-[10.5px] text-[#9b3a32]">
              <AlertCircle className="h-3 w-3" />
              <span>Blocked by {item.blockedBy!.length}</span>
            </div>
          )}
          {isBlocking && (
            <div className="flex items-center gap-1 rounded-md border border-[#efddbf] bg-[#fbf3e6] px-1.5 py-0.5 text-[10.5px] text-[#95642a]">
              <AlertCircle className="h-3 w-3" />
              <span>Blocking {item.blocking!.length}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#eadbc4] pt-2">
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${priorityDots[item.priority]}`} />
          <span className="text-[11px] capitalize text-[#746652]">{item.priority}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleBreakdown}
            className="rounded-md p-1 text-[#85745f] transition-colors hover:bg-[#f4e6d1] hover:text-[#5e4f3a]"
            title="AI Breakdown"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleDelete}
            className="rounded-md p-1 text-[#85745f] transition-colors hover:bg-[#f8e5e2] hover:text-[#a63b31]"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
