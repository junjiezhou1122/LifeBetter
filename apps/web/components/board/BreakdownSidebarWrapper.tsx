import { Sparkles, X } from "lucide-react";
import { BreakdownSidebarContent } from "../sidebar/breakdown/BreakdownSidebarContent";

interface BreakdownSidebarWrapperProps {
  isOpen: boolean;
  id: string;
  title: string;
  parentId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function BreakdownSidebarWrapper({
  isOpen,
  id,
  title,
  parentId,
  onClose,
  onConfirm,
}: BreakdownSidebarWrapperProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[500px] bg-white border-l border-stone-200 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-stone-900">AI Breakdown</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Close breakdown sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <BreakdownSidebarContent
          itemId={id}
          title={title}
          parentId={parentId}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
}
