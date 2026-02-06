import { cn } from '@/lib/utils';

type SidebarView = 'priorities' | 'notifications' | 'daily';

interface SidebarTabsProps {
  activeView: SidebarView;
  onTabChange: (view: SidebarView) => void;
  notificationCount: number;
}

export function SidebarTabs({ activeView, onTabChange, notificationCount }: SidebarTabsProps) {
  return (
    <div className="mb-3 grid grid-cols-3 gap-1.5">
      <button
        onClick={() => onTabChange('priorities')}
        className={cn(
          'rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors',
          activeView === 'priorities'
            ? 'bg-[#f2d6ad] text-[#6b4320]'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        )}
      >
        Priorities
      </button>
      <button
        onClick={() => onTabChange('notifications')}
        className={cn(
          'relative rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors',
          activeView === 'notifications'
            ? 'bg-[#f2d6ad] text-[#6b4320]'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        )}
      >
        Alerts
        {notificationCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#b73b30] text-[10px] font-semibold text-white">
            {notificationCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange('daily')}
        className={cn(
          'rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors',
          activeView === 'daily'
            ? 'bg-[#f2d6ad] text-[#6b4320]'
            : 'bg-[#f7eddc] text-[#756652] hover:bg-[#f2e1c7]'
        )}
      >
        Today
      </button>
    </div>
  );
}
