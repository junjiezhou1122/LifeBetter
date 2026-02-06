"use client";

import { LeftSidebar } from "../sidebar/LeftSidebar";
import { ItemDetailSidebar } from "../sidebar/item-detail/ItemDetailSidebar";
import { MetaSkillFeedbackModal } from "../modals/MetaSkillFeedbackModal";
import { BreakdownSidebarWrapper } from "./BreakdownSidebarWrapper";
import { BoardView } from "./BoardView";
import { useItems } from "@/hooks/useItems";
import { useNavigation } from "@/hooks/useNavigation";
import { useMetaSkills } from "@/hooks/useMetaSkills";
import { ROOT_COLUMNS, NESTED_COLUMNS } from "./board-constants";
import { useUnifiedBoard } from "./useUnifiedBoard";
import { useDragDropHandlers } from "./useDragDropHandlers";
import type { Item, ItemStatus } from "@/types";

export function UnifiedBoard() {
  const {
    items,
    allItems,
    loading,
    getChildCount,
    addItem,
    deleteItem,
    updateItem,
    refreshItems,
  } = useItems(null);

  const {
    navigationStack,
    isRootLevel,
    drillDown,
    navigateToBreadcrumb,
    goBack,
  } = useNavigation();

  const { metaSkills, updateMetaSkill } = useMetaSkills();

  const {
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
  } = useUnifiedBoard();

  const { handleDragEnd } = useDragDropHandlers({
    items,
    updateItem,
    openFeedbackModal,
    metaSkills,
  });

  const columns = isRootLevel ? ROOT_COLUMNS : NESTED_COLUMNS;

  const handleItemClick = (item: Item) => {
    openDetailSidebar(item);
  };

  const handleDrillDown = (item: Item) => {
    drillDown(item.id, item.title, item.depth);
  };

  const handleBreadcrumbClick = (index: number) => {
    navigateToBreadcrumb(index);
  };

  const handleBack = () => {
    goBack();
  };

  const handleAddItem = async (
    title: string,
    description: string,
    priority: string,
    status?: ItemStatus,
  ) => {
    await addItem(title, description, priority, status);
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<Item>) => {
    await updateItem(itemId, updates);
    updateDetailSidebarItem(updates);
  };

  const handleMetaSkillFeedback = async (success: boolean) => {
    if (!feedbackModal.item) return;

    await updateItem(feedbackModal.item.id, { metaSkillSuccess: success });

    if (feedbackModal.item.solvedWithMetaSkill) {
      await updateMetaSkill(feedbackModal.item.solvedWithMetaSkill, {
        timesSuccessful: success ? 1 : 0,
      });
    }

    closeFeedbackModal();
  };

  const handlePlanAgentItemClick = (itemId: string) => {
    const item = allItems.find((i) => i.id === itemId);
    if (item) {
      openDetailSidebar(item);
    }
  };

  const handleToggleSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  const handleBreakdownConfirm = async () => {
    await refreshItems();
    closeBreakdownSidebar();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-stone-50 flex">
      <LeftSidebar
        isOpen={leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
        onItemClick={handlePlanAgentItemClick}
        onNavigate={(view) => setCurrentView(view)}
      />

      <BoardView
        currentView={currentView}
        navigationStack={navigationStack}
        isRootLevel={isRootLevel}
        leftSidebarOpen={leftSidebarOpen}
        items={items}
        columns={columns}
        getChildCount={getChildCount}
        onToggleSidebar={handleToggleSidebar}
        onBreadcrumbClick={handleBreadcrumbClick}
        onBack={handleBack}
        onSearchResultClick={handlePlanAgentItemClick}
        onItemClick={handleItemClick}
        onDrillDown={handleDrillDown}
        onBreakdown={openBreakdownSidebar}
        onDelete={handleDeleteItem}
        onAddItem={handleAddItem}
        onDragEnd={handleDragEnd}
      />

      <BreakdownSidebarWrapper
        isOpen={breakdownSidebar.isOpen}
        id={breakdownSidebar.id}
        title={breakdownSidebar.title}
        onClose={closeBreakdownSidebar}
        onConfirm={handleBreakdownConfirm}
      />

      {detailSidebar.isOpen && detailSidebar.item && (
        <ItemDetailSidebar
          key={detailSidebar.item.id}
          item={detailSidebar.item}
          onClose={closeDetailSidebar}
          onUpdate={(updates) =>
            handleUpdateItem(detailSidebar.item!.id, updates)
          }
        />
      )}

      {feedbackModal.isOpen && feedbackModal.item && (
        <MetaSkillFeedbackModal
          itemTitle={feedbackModal.item.title}
          metaSkillName={feedbackModal.metaSkillName}
          metaSkillId={feedbackModal.item.solvedWithMetaSkill!}
          onSubmit={handleMetaSkillFeedback}
          onSkip={closeFeedbackModal}
        />
      )}
    </div>
  );
}
