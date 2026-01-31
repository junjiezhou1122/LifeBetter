import { Home, X } from 'lucide-react';

interface LeftSidebarHeaderProps {
  onClose: () => void;
}

export function LeftSidebarHeader({ onClose }: LeftSidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
      <div className="flex items-center gap-2">
        <Home className="w-5 h-5 text-stone-700" />
        <h2 className="text-base font-semibold text-stone-900">LifeBetter</h2>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        aria-label="Close sidebar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
