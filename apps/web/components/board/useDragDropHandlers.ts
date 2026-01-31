import { DropResult } from '@hello-pangea/dnd';
import type { Item, ItemStatus } from '@/types';

interface UseDragDropHandlersProps {
  items: Item[];
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  openFeedbackModal: (item: Item, metaSkillName: string) => void;
  metaSkills: any[];
}

export function useDragDropHandlers({
  items,
  updateItem,
  openFeedbackModal,
  metaSkills
}: UseDragDropHandlersProps) {
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ItemStatus;
    const item = items.find((i) => i.id === draggableId);

    if (
      newStatus === 'done' &&
      item?.solvedWithMetaSkill &&
      source.droppableId !== 'done'
    ) {
      const metaSkill = metaSkills.find(
        (ms) => ms.id === item.solvedWithMetaSkill,
      );
      if (metaSkill) {
        openFeedbackModal(item, metaSkill.name);
      }
    }

    updateItem(draggableId, { status: newStatus });
  };

  return { handleDragEnd };
}
