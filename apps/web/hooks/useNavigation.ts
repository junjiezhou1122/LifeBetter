import { useState } from 'react';
import type { NavigationItem } from '@/types';

export function useNavigation() {
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([
    { id: null, title: 'Home', depth: 0 },
  ]);

  const currentNav = navigationStack[navigationStack.length - 1];
  const currentParentId = currentNav.id;
  const currentDepth = currentNav.depth;
  const isRootLevel = currentDepth === 0;

  const drillDown = (itemId: string, title: string, depth: number) => {
    setNavigationStack([
      ...navigationStack,
      { id: itemId, title, depth: depth + 1 },
    ]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setNavigationStack(navigationStack.slice(0, index + 1));
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack((prev) => prev.slice(0, -1));
    }
  };

  const resetToHome = () => {
    setNavigationStack([{ id: null, title: 'Home', depth: 0 }]);
  };

  return {
    navigationStack,
    currentParentId,
    currentDepth,
    isRootLevel,
    drillDown,
    navigateToBreadcrumb,
    goBack,
    resetToHome,
  };
}
