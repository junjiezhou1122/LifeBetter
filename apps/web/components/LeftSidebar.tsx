'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Target, Brain, Home, ChevronRight, X, Calendar, LayoutDashboard, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityItem {
  id: string;
  title: string;
  priority: string;
  status: string;
  score: number;
  reason: string;
  age: number;
  blockedBy?: string[];
  blocking?: string[];
}

interface Notification {
  id: string;
  type: 'overdue' | 'blocked' | 'suggestion' | 'daily_plan';
  title: string;
  message: string;
  itemId?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: (itemId: string) => void;
  onNavigate?: (view: 'board' | 'dashboard' | 'timeline' | 'meta-skills' | 'reflection') => void;
}

export function LeftSidebar({ isOpen, onClose, onItemClick, onNavigate }: LeftSidebarProps) {
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'priorities' | 'notifications' | 'daily'>('priorities');

  useEffect(() => {
    if (isOpen) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [prioritiesRes, notificationsRes] = await Promise.all([
        fetch('/api/plan/priorities'),
        fetch('/api/plan/notifications')
      ]);

      const prioritiesData = await prioritiesRes.json();
      const notificationsData = await notificationsRes.json();

      setPriorities(prioritiesData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to fetch plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-stone-600 bg-stone-50 border-stone-200';
      default:
        return 'text-stone-600 bg-stone-50 border-stone-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <Clock className="w-4 h-4 text-red-600" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'suggestion':
        return <Target className="w-4 h-4 text-stone-600" />;
      case 'daily_plan':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-stone-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 bottom-0 z-[60] bg-white border-r border-stone-200 w-80 shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-stone-700" />
          <h2 className="text-base font-semibold text-stone-900">LifeBetter</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="border-b border-stone-200 bg-stone-50">
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100"
        >
          <LayoutDashboard className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-medium text-sm">Dashboard</div>
            <div className="text-xs text-stone-500">Overview & statistics</div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => onNavigate?.('board')}
          className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
        >
          <Target className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-medium text-sm">Board</div>
            <div className="text-xs text-stone-500">Manage your items</div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => onNavigate?.('timeline')}
          className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
        >
          <Calendar className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-medium text-sm">Timeline</div>
            <div className="text-xs text-stone-500">View activity history</div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => onNavigate?.('reflection')}
          className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
        >
          <BookOpen className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-medium text-sm">Daily Reflection</div>
            <div className="text-xs text-stone-500">Track your growth</div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => onNavigate?.('meta-skills')}
          className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
        >
          <Brain className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-medium text-sm">Meta-Skills</div>
            <div className="text-xs text-stone-500">Browse & manage skills</div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* Smart Planning Content (no title) */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveView('priorities')}
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
              onClick={() => setActiveView('notifications')}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors relative',
                activeView === 'notifications'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              )}
            >
              Alerts
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('daily')}
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

          {/* Content based on active view */}
          {activeView === 'priorities' && (
            loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-stone-500">Loading...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {priorities.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p className="text-sm">All caught up! 🎉</p>
                  </div>
                ) : (
                  priorities.slice(0, 10).map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300"
                      onClick={() => onItemClick?.(item.id)}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-stone-900 line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full border font-medium',
                          getPriorityColor(item.priority)
                        )}>
                          {item.priority}
                        </span>
                        <span className="text-xs text-stone-500">
                          {item.age}d old
                        </span>
                      </div>

                      <p className="text-xs text-stone-600">
                        {item.reason}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )
          )}

        {activeView === 'notifications' && (
          <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
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
                          dismissNotification(notification.id);
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
                ))
              )}
            </div>
        )}

        {activeView === 'daily' && (
          <>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-semibold text-stone-900">Today&apos;s Focus</h3>
              </div>
              <p className="text-xs text-stone-600">
                Focus on your top {Math.min(3, priorities.length)} priority items today.
              </p>
            </div>

            <div className="space-y-3">
              {priorities.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300"
                  onClick={() => onItemClick?.(item.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-stone-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-600">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {priorities.length === 0 && (
                <div className="text-center py-8 text-stone-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                  <p className="text-sm">No items to focus on today</p>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
