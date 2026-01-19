'use client';

import { ReactNode } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  title?: string;
  children: ReactNode;
  defaultWidth?: number;
  collapsible?: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  side,
  title,
  children,
  defaultWidth = 400,
  collapsible = true
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-[60] bg-stone-100 border-l border-stone-200 transition-transform duration-300 ease-in-out',
          side === 'left' ? 'left-0' : 'right-0'
        )}
        style={{ width: `${defaultWidth}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          {title && <h2 className="text-base font-semibold text-stone-900">{title}</h2>}
          <div className="flex items-center gap-1 ml-auto">
            {collapsible && (
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                title="Collapse"
                aria-label="Collapse sidebar"
              >
                {side === 'left' ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              title="Close"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] p-6">
          {children}
        </div>
      </div>
    </>
  );
}
