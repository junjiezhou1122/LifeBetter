import { useState, useEffect } from 'react';
import type { Item } from '@/types';
import type { TabType } from '../sidebar/item-detail/ItemSidebarTabs';
import type { AITabMode } from '../sidebar/breakdown/BreakdownSidebarContent';

export function useUnifiedBoard() {
  const [detailSidebar, setDetailSidebar] = useState<{
    isOpen: boolean;
    item: Item | null;
    activeTab: TabType;
    aiMode: AITabMode;
  }>({ isOpen: false, item: null, activeTab: 'details', aiMode: 'breakdown' });

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    item: Item | null;
    metaSkillName: string;
  }>({ isOpen: false, item: null, metaSkillName: '' });

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leftSidebarOpen');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [currentView, setCurrentView] = useState<'board' | 'dashboard' | 'timeline' | 'meta-skills' | 'reflection'>('board');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('leftSidebarOpen', JSON.stringify(leftSidebarOpen));
    }
  }, [leftSidebarOpen]);

  const openDetailSidebar = (
    item: Item,
    tab: TabType = 'details',
    aiMode: AITabMode = 'breakdown',
  ) => {
    setDetailSidebar({ isOpen: true, item, activeTab: tab, aiMode });
  };

  const closeDetailSidebar = () => {
    setDetailSidebar({
      isOpen: false,
      item: null,
      activeTab: 'details',
      aiMode: 'breakdown',
    });
  };

  const openFeedbackModal = (item: Item, metaSkillName: string) => {
    setFeedbackModal({ isOpen: true, item, metaSkillName });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, item: null, metaSkillName: '' });
  };

  const updateDetailSidebarItem = (updates: Partial<Item>) => {
    setDetailSidebar((prev) => {
      if (!prev.item) return prev;
      return {
        ...prev,
        item: {
          ...prev.item,
          ...updates,
          updatedAt: new Date().toISOString(),
        } as Item,
      };
    });
  };

  return {
    detailSidebar,
    feedbackModal,
    leftSidebarOpen,
    currentView,
    setLeftSidebarOpen,
    setCurrentView,
    openDetailSidebar,
    closeDetailSidebar,
    openFeedbackModal,
    closeFeedbackModal,
    updateDetailSidebarItem,
  };
}
