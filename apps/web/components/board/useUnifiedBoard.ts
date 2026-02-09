import { useState, useEffect } from 'react';
import type { Item } from '@/types';

export function useUnifiedBoard() {
  const [breakdownSidebar, setBreakdownSidebar] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({ isOpen: false, id: '', title: '' });

  const [detailSidebar, setDetailSidebar] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });

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

  const openBreakdownSidebar = (id: string, title: string) => {
    // Keep right-side panels mutually exclusive.
    setDetailSidebar({ isOpen: false, item: null });
    setBreakdownSidebar({ isOpen: true, id, title });
  };

  const closeBreakdownSidebar = () => {
    setBreakdownSidebar((prev) => ({ ...prev, isOpen: false }));
  };

  const openDetailSidebar = (item: Item) => {
    // Keep right-side panels mutually exclusive.
    setBreakdownSidebar((prev) => ({ ...prev, isOpen: false }));
    setDetailSidebar({ isOpen: true, item });
  };

  const closeDetailSidebar = () => {
    setDetailSidebar({ isOpen: false, item: null });
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
    breakdownSidebar,
    detailSidebar,
    feedbackModal,
    leftSidebarOpen,
    currentView,
    setLeftSidebarOpen,
    setCurrentView,
    openBreakdownSidebar,
    closeBreakdownSidebar,
    openDetailSidebar,
    closeDetailSidebar,
    openFeedbackModal,
    closeFeedbackModal,
    updateDetailSidebarItem,
  };
}
