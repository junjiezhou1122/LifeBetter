import { AlertCircle, FileText } from 'lucide-react';

type TabType = 'details' | 'notes';

interface ItemSidebarTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ItemSidebarTabs({ activeTab, onTabChange }: ItemSidebarTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5 border-b border-[#dec9a8] bg-[#fff3de]/70 px-4 py-2">
      <button
        onClick={() => onTabChange('details')}
        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          activeTab === 'details'
            ? 'bg-[#f2d6ad] text-[#6b4320]'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        }`}
      >
        <AlertCircle className="mr-1.5 inline h-3.5 w-3.5" />
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
        <FileText className="mr-1.5 inline h-3.5 w-3.5" />
        Notes
      </button>
    </div>
  );
}
