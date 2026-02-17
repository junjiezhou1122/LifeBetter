import { AlertCircle, FileText, Sparkles, BookOpen } from 'lucide-react';

export type TabType = 'details' | 'notes' | 'ai' | 'experience';

interface ItemSidebarTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ItemSidebarTabs({ activeTab, onTabChange }: ItemSidebarTabsProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 border-b border-[#dec9a8] bg-[#fff3de]/70 px-4 py-2">
      <button
        onClick={() => onTabChange('details')}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          activeTab === 'details'
            ? 'bg-[#f2d6ad] text-[#6b4320]'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        }`}
      >
        <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
        Details
      </button>
      <button
        onClick={() => onTabChange('notes')}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          activeTab === 'notes'
            ? 'bg-[#f2d6ad] text-[#6b4320]'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        }`}
      >
        <FileText className="mr-1 inline h-3.5 w-3.5" />
        Notes
      </button>
      <button
        onClick={() => onTabChange('ai')}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          activeTab === 'ai'
            ? 'bg-[#d26a3b] text-white'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        }`}
      >
        <Sparkles className="mr-1 inline h-3.5 w-3.5" />
        AI
      </button>
      <button
        onClick={() => onTabChange('experience')}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          activeTab === 'experience'
            ? 'bg-[#f2d6ad] text-[#6b4320]'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        }`}
      >
        <BookOpen className="mr-1 inline h-3.5 w-3.5" />
        Exp
      </button>
    </div>
  );
}
