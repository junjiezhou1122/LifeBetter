'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ItemCard } from './ItemCard';
import { Sidebar } from './Sidebar';
import { EditableItemCard } from './EditableItemCard';
import { BreakdownSidebarContent } from './BreakdownSidebarContent';
import { ItemDetailSidebar } from './ItemDetailSidebar';
import { MetaSkillFeedbackModal } from './MetaSkillFeedbackModal';
import { Plus, ChevronLeft, Brain } from 'lucide-react';
import Link from 'next/link';

type ItemStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done';

interface Item {
  id: string;
  title: string;
  description?: string;
  parentId: string | null;
  depth: number;
  status: ItemStatus;
  priority: string;
  createdAt: string;
  updatedAt: string;
  breakdownStatus?: string;
  tags?: string[];
  blockedBy?: string[];
  blocking?: string[];
  canBreakdown?: boolean;
  order: number;
}

interface NavigationItem {
  id: string | null;
  title: string;
  depth: number;
}

// Column configuration based on depth
const ROOT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-stone-200', textColor: 'text-stone-700' },
  { id: 'todo', title: 'To Do', color: 'bg-sky-100', textColor: 'text-sky-800' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-100', textColor: 'text-amber-800' },
  { id: 'blocked', title: 'Blocked', color: 'bg-rose-100', textColor: 'text-rose-800' },
  { id: 'done', title: 'Done', color: 'bg-emerald-100', textColor: 'text-emerald-800' },
];

const NESTED_COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-sky-100', textColor: 'text-sky-800' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-100', textColor: 'text-amber-800' },
  { id: 'blocked', title: 'Blocked', color: 'bg-rose-100', textColor: 'text-rose-800' },
  { id: 'done', title: 'Done', color: 'bg-emerald-100', textColor: 'text-emerald-800' },
];

export function UnifiedBoard() {
  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]); // For child count
  const [loading, setLoading] = useState(true);
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([
    { id: null, title: 'Home', depth: 0 }
  ]);
  const [quickAddText, setQuickAddText] = useState('');
  const [showEditableCard, setShowEditableCard] = useState<{ [key: string]: boolean }>({});
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
  const [metaSkills, setMetaSkills] = useState<any[]>([]);

  const currentNav = navigationStack[navigationStack.length - 1];
  const currentParentId = currentNav.id;
  const currentDepth = currentNav.depth;
  const isRootLevel = currentDepth === 0;

  // Choose columns based on depth
  const columns = isRootLevel ? ROOT_COLUMNS : NESTED_COLUMNS;

  // Fetch items for current level
  useEffect(() => {
    async function fetchItems() {
      try {
        const parentParam = currentParentId === null ? 'null' : currentParentId;
        const res = await fetch(`/api/items?parentId=${parentParam}`);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [currentParentId]);

  // Fetch all items for child count
  useEffect(() => {
    async function fetchAllItems() {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();
        setAllItems(data);
      } catch (error) {
        console.error('Failed to fetch all items:', error);
      }
    }

    fetchAllItems();
  }, [items]);

  // Fetch meta-skills
  useEffect(() => {
    async function fetchMetaSkills() {
      try {
        const res = await fetch('/api/meta-skills');
        const data = await res.json();
        setMetaSkills(data);
      } catch (error) {
        console.error('Failed to fetch meta-skills:', error);
      }
    }

    fetchMetaSkills();
  }, []);

  const getChildCount = (itemId: string) => {
    return allItems.filter(item => item.parentId === itemId).length;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as ItemStatus;
    const item = items.find(i => i.id === draggableId);

    // Check if moving to "done" and has a meta-skill
    if (newStatus === 'done' && item?.solvedWithMetaSkill && source.droppableId !== 'done') {
      const metaSkill = metaSkills.find(ms => ms.id === item.solvedWithMetaSkill);
      if (metaSkill) {
        // Show feedback modal
        setFeedbackModal({
          isOpen: true,
          item,
          metaSkillName: metaSkill.name
        });
      }
    }

    // Optimistic update
    setItems(prev =>
      prev.map(item =>
        item.id === draggableId
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );

    // Update on server
    try {
      await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggableId, updates: { status: newStatus } })
      });
    } catch (error) {
      console.error('Failed to update item:', error);
      // Revert on error
      setItems(prev =>
        prev.map(item =>
          item.id === draggableId
            ? { ...item, status: source.droppableId as ItemStatus }
            : item
        )
      );
    }
  };

  const handleItemClick = (item: Item) => {
    // Open detail sidebar instead of drilling down
    setDetailSidebar({ isOpen: true, item });
  };

  const handleDrillDown = (item: Item) => {
    // Separate function for drilling down into children
    setNavigationStack([
      ...navigationStack,
      { id: item.id, title: item.title, depth: item.depth + 1 }
    ]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setNavigationStack(navigationStack.slice(0, index + 1));
  };

  const handleBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const handleAddItem = async (title: string, description: string, priority: string, status?: ItemStatus) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: currentParentId,
          title,
          description,
          priority,
          status
        })
      });
      const newItem = await res.json();
      setItems(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddText.trim()) {
      await handleAddItem(quickAddText.trim(), '', 'medium');
      setQuickAddText('');
    }
  };

  const handleEditableCardSave = async (columnId: ItemStatus, title: string, description: string, priority: string) => {
    await handleAddItem(title, description, priority, columnId);
    setShowEditableCard(prev => ({ ...prev, [columnId]: false }));
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await fetch(`/api/items?id=${itemId}`, {
        method: 'DELETE'
      });
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<Item>) => {
    try {
      await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, updates })
      });

      // Update local state
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
      );

      // Update detail sidebar if it's the same item
      if (detailSidebar.item?.id === itemId) {
        setDetailSidebar({
          ...detailSidebar,
          item: { ...detailSidebar.item, ...updates, updatedAt: new Date().toISOString() }
        });
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleMetaSkillFeedback = async (success: boolean) => {
    if (!feedbackModal.item) return;

    try {
      // Update item with feedback
      await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: feedbackModal.item.id,
          updates: { metaSkillSuccess: success }
        })
      });

      // Update meta-skill success count
      if (feedbackModal.item.solvedWithMetaSkill) {
        await fetch('/api/meta-skills', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: feedbackModal.item.solvedWithMetaSkill,
            updates: {
              timesSuccessful: success ? 1 : 0 // Will be incremented in API
            }
          })
        });
      }

      setFeedbackModal({ isOpen: false, item: null, metaSkillName: '' });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleBreakdownConfirm = async () => {
    try {
      const parentParam = currentParentId === null ? 'null' : currentParentId;
      const res = await fetch(`/api/items?parentId=${parentParam}`);
      const data = await res.json();
      setItems(data);
      setBreakdownSidebar({ ...breakdownSidebar, isOpen: false });
    } catch (error) {
      console.error('Failed to refresh items:', error);
    }
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
      {/* Main Content */}
      <div className={`flex-1 p-6 transition-all duration-300 ${breakdownSidebar.isOpen ? 'mr-[400px]' : 'mr-0'}`}>
        {/* Header with Breadcrumb */}
        <div className="mb-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {navigationStack.map((nav, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-stone-400">/</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`text-sm transition-colors ${
                      index === navigationStack.length - 1
                        ? 'text-stone-900 font-medium'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {nav.title}
                  </button>
                </div>
              ))}
            </div>

            {/* Meta-Skills Library Link */}
            <Link
              href="/meta-skills"
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Brain className="w-4 h-4" />
              Meta-Skills Library
            </Link>
          </div>

          {/* Back Button (if not at root) */}
          {!isRootLevel && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}

          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              {isRootLevel ? '📊 All Items' : `📋 ${currentNav.title}`}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {items.length} item{items.length === 1 ? '' : 's'} • Level {currentDepth}
            </p>
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={`grid gap-4 h-[calc(100vh-200px)] ${
            isRootLevel ? 'grid-cols-5' : 'grid-cols-4'
          }`}>
            {columns.map(column => {
              const columnItems = items.filter(item => item.status === column.id);

              return (
                <div key={column.id} className="flex flex-col">
                  <div className={`${column.color} rounded-t-xl px-4 py-3 border-b border-stone-200`}>
                    <h2 className={`text-sm font-semibold ${column.textColor}`}>
                      {column.title}
                      <span className="ml-2 text-xs opacity-70">({columnItems.length})</span>
                    </h2>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto bg-white rounded-b-xl border border-stone-200 ${
                          snapshot.isDraggingOver ? 'bg-stone-50' : ''
                        }`}
                      >
                        {/* Quick Add in Column */}
                        <div className="mb-3">
                          <button
                            onClick={() => setShowEditableCard(prev => ({ ...prev, [column.id]: true }))}
                            className="w-full p-3 border border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add</span>
                          </button>
                        </div>

                        {/* Editable Card */}
                        {showEditableCard[column.id] && (
                          <EditableItemCard
                            onSave={(title, description, priority) => handleEditableCardSave(column.id, title, description, priority)}
                            onCancel={() => setShowEditableCard(prev => ({ ...prev, [column.id]: false }))}
                          />
                        )}

                        {columnItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                              >
                                <ItemCard
                                  item={item}
                                  childCount={getChildCount(item.id)}
                                  onClick={() => handleItemClick(item)}
                                  onDrillDown={() => handleDrillDown(item)}
                                  onBreakdown={() => setBreakdownSidebar({
                                    isOpen: true,
                                    id: item.id,
                                    title: item.title
                                  })}
                                  onDelete={() => handleDeleteItem(item.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Breakdown Sidebar */}
      <Sidebar
        isOpen={breakdownSidebar.isOpen}
        onClose={() => setBreakdownSidebar({ ...breakdownSidebar, isOpen: false })}
        side="right"
        title="AI Breakdown"
      >
        <BreakdownSidebarContent
          itemId={breakdownSidebar.id}
          title={breakdownSidebar.title}
          parentId={currentParentId}
          onConfirm={handleBreakdownConfirm}
        />
      </Sidebar>

      {/* Item Detail Sidebar */}
      {detailSidebar.isOpen && detailSidebar.item && (
        <ItemDetailSidebar
          item={detailSidebar.item}
          onClose={() => setDetailSidebar({ isOpen: false, item: null })}
          onUpdate={(updates) => handleUpdateItem(detailSidebar.item!.id, updates)}
        />
      )}

      {/* Meta-Skill Feedback Modal */}
      {feedbackModal.isOpen && feedbackModal.item && (
        <MetaSkillFeedbackModal
          itemTitle={feedbackModal.item.title}
          metaSkillName={feedbackModal.metaSkillName}
          metaSkillId={feedbackModal.item.solvedWithMetaSkill!}
          onSubmit={handleMetaSkillFeedback}
          onSkip={() => setFeedbackModal({ isOpen: false, item: null, metaSkillName: '' })}
        />
      )}
    </div>
  );
}
