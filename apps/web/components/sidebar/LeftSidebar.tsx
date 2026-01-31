'use client';

import { useEffect, useState } from 'react';
import { LeftSidebarHeader } from './left-sidebar/LeftSidebarHeader';
import { NavigationMenu } from './left-sidebar/NavigationMenu';
import { SidebarTabs } from './left-sidebar/SidebarTabs';
import { PriorityList } from './left-sidebar/PriorityList';
import { NotificationList } from './left-sidebar/NotificationList';
import { DailyFocus } from './left-sidebar/DailyFocus';

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

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 bottom-0 z-[60] bg-white border-r border-stone-200 w-80 shadow-lg flex flex-col">
      <LeftSidebarHeader onClose={onClose} />

      <NavigationMenu onNavigate={(view) => onNavigate?.(view)} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <SidebarTabs
            activeView={activeView}
            onTabChange={setActiveView}
            notificationCount={notifications.length}
          />

          {activeView === 'priorities' && (
            <PriorityList
              priorities={priorities}
              loading={loading}
              onItemClick={onItemClick}
            />
          )}

          {activeView === 'notifications' && (
            <NotificationList
              notifications={notifications}
              onDismiss={dismissNotification}
              onItemClick={onItemClick}
            />
          )}

          {activeView === 'daily' && (
            <DailyFocus
              priorities={priorities}
              onItemClick={onItemClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
