import { Clock, AlertTriangle, Target, AlertCircle, X, ChevronRight } from 'lucide-react';

interface Notification {
  id: string;
  type: 'overdue' | 'blocked' | 'suggestion' | 'daily_plan';
  title: string;
  message: string;
  itemId?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onItemClick?: (itemId: string) => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'overdue':
      return <Clock className="w-4 h-4 text-red-600" />;
    case 'blocked':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'suggestion':
      return <Target className="w-4 h-4 text-stone-600" />;
    case 'daily_plan':
      return <div className="w-4 h-4 text-green-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-stone-500" />;
  }
}

export function NotificationList({ notifications, onDismiss, onItemClick }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-7 text-center text-[#7a6b57]">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#d9efe4]">
          <svg className="h-5 w-5 text-[#2f7b65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="rounded-lg border border-[#dbc9ad] bg-white/80 p-2.5 transition-shadow hover:shadow-[0_8px_18px_rgba(95,67,31,0.12)]"
        >
          <div className="mb-1.5 flex items-start gap-2">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-[#34281c]">
                {notification.title}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="flex-shrink-0 rounded p-1 text-[#8c7c66] transition-colors hover:bg-[#f3e6d2] hover:text-[#5d4f3a]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <p className="mb-1.5 text-[11px] text-[#6e604f]">
            {notification.message}
          </p>

          {notification.itemId && (
            <button
              onClick={() => onItemClick?.(notification.itemId!)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#8a5529] transition hover:text-[#6d3e19]"
            >
              View item
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
