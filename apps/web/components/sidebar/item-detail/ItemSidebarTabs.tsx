import { AlertCircle, FileText } from 'lucide-react';

type TabType = 'details' | 'notes';

interface ItemSidebarTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ItemSidebarTabs({ activeTab, onTabChange }: ItemSidebarTabsProps) {
  return (
    <div className="flex gap-2 px-6 border-b border-stone-200 bg-white">
      <button
        onClick={() => onTabChange('details')}
        className={`px-4 py-3 text-sm font-medium transition-colors ${
          activeTab === 'details'
            ? 'text-amber-600 border-b-2 border-amber-600'
            : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        <AlertCircle className="w-4 h-4 inline mr-2" />
        Details
      </button>
      <button
        onClick={() => onTabChange('notes')}
        className={`px-4 py-3 text-sm font-medium transition-colors ${
          activeTab === 'notes'
            ? 'text-amber-600 border-b-2 border-amber-600'
            : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        <FileText className="w-4 h-4 inline mr-2" />
        Notes
      </button>
    </div>
  );
}
