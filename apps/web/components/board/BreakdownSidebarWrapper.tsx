import { Sparkles, X } from "lucide-react";
import { BreakdownSidebarContent } from "../sidebar/breakdown/BreakdownSidebarContent";

interface BreakdownSidebarWrapperProps {
  isOpen: boolean;
  id: string;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function BreakdownSidebarWrapper({
  isOpen,
  id,
  title,
  onClose,
  onConfirm,
}: BreakdownSidebarWrapperProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 top-0 z-50 flex w-[26rem] max-w-[92vw] flex-col border-l border-[#d7c2a3] bg-[linear-gradient(180deg,#fffefb,#fff7ea)] shadow-[0_14px_32px_rgba(96,66,29,0.16)]">
      <div className="flex items-center justify-between border-b border-[#dec9a8] bg-[linear-gradient(120deg,#fff7ea,#f8e9d0)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] text-[#b35a2f]" />
          <h2 className="lb-display text-lg font-semibold text-[#2e2418]">AI Breakdown</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-[#8e7e67] transition-colors hover:bg-white/70 hover:text-[#5f513e]"
          aria-label="Close breakdown sidebar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="lb-scrollbar flex-1 overflow-y-auto p-4">
        <BreakdownSidebarContent
          itemId={id}
          title={title}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
}
