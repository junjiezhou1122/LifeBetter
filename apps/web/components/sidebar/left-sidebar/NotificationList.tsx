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
      <div className="text-center py-8 text-stone-500">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-2 mb-2">
            {getNotificationIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-stone-900">
                {notification.title}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="flex-shrink-0 p-1 text-stone-400 hover:text-stone-600 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-stone-600 mb-2">
            {notification.message}
          </p>

          {notification.itemId && (
            <button
              onClick={() => onItemClick?.(notification.itemId!)}
              className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
            >
              View item
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
