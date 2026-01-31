import { cn } from '@/lib/utils';

type SidebarView = 'priorities' | 'notifications' | 'daily';

interface SidebarTabsProps {
  activeView: SidebarView;
  onTabChange: (view: SidebarView) => void;
  notificationCount: number;
}

export function SidebarTabs({ activeView, onTabChange, notificationCount }: SidebarTabsProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onTabChange('priorities')}
        className={cn(
          'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
          activeView === 'priorities'
            ? 'bg-amber-100 text-amber-900'
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
        )}
      >
        Priorities
      </button>
      <button
        onClick={() => onTabChange('notifications')}
        className={cn(
          'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors relative',
          activeView === 'notifications'
            ? 'bg-amber-100 text-amber-900'
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
        )}
      >
        Alerts
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange('daily')}
        className={cn(
          'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
          activeView === 'daily'
            ? 'bg-amber-100 text-amber-900'
            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
        )}
      >
        Today
      </button>
    </div>
  );
}
