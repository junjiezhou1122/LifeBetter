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
      {/* Backdrop - semi-transparent, not blocking */}
      <div
        className="fixed inset-0 bg-black bg-opacity-10 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 bottom-0 z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          side === 'left' ? 'left-0' : 'right-0'
        )}
        style={{ width: `${defaultWidth}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          <div className="flex items-center gap-2 ml-auto">
            {collapsible && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Collapse"
              >
                {side === 'left' ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] p-4">
          {children}
        </div>
      </div>
    </>
  );
}
