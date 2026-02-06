import { Home, X } from 'lucide-react';

interface LeftSidebarHeaderProps {
  onClose: () => void;
}

export function LeftSidebarHeader({ onClose }: LeftSidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#dec9a8] bg-[linear-gradient(120deg,#fff7ea,#f8e9d0)] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Home className="h-[18px] w-[18px] text-[#6f4c24]" />
        <h2 className="lb-display text-base font-semibold text-[#2e2418]">LifeBetter</h2>
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1 text-[#8e7e67] transition-colors hover:bg-white/70 hover:text-[#5f513e]"
        aria-label="Close sidebar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
