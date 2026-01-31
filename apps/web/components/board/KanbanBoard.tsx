import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { ItemCard } from "./ItemCard";
import { EditableItemCard } from "./EditableItemCard";
import type { Item, ItemStatus, Column } from "@/types";

interface KanbanBoardProps {
  items: Item[];
  columns: Column[];
  getChildCount: (itemId: string) => number;
  onItemClick: (item: Item) => void;
  onDrillDown: (item: Item) => void;
  onBreakdown: (itemId: string, title: string) => void;
  onDelete: (itemId: string) => void;
  onAddItem: (
    title: string,
    description: string,
    priority: string,
    status?: ItemStatus,
  ) => Promise<void>;
  onDragEnd: (result: DropResult) => void;
}

export function KanbanBoard({
  items,
  columns,
  getChildCount,
  onItemClick,
  onDrillDown,
  onBreakdown,
  onDelete,
  onAddItem,
  onDragEnd,
}: KanbanBoardProps) {
  const [showEditableCard, setShowEditableCard] = useState<
    Record<string, boolean>
  >({});

  const handleEditableCardSave = async (
    columnId: ItemStatus,
    title: string,
    description: string,
    priority: string,
  ) => {
    await onAddItem(title, description, priority, columnId);
    setShowEditableCard((prev: Record<string, boolean>) => ({
      ...prev,
      [columnId]: false,
    }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 h-[calc(100vh-140px)] grid-cols-4">
        {/* Render each column */}
        {columns.map((column) => {
          const columnItems = items.filter((item) => item.status === column.id);

          return (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div
                className={`${column.color} rounded-t-xl px-4 py-3 border-b border-stone-200`}
              >
                <h2 className={`text-sm font-semibold ${column.textColor}`}>
                  {column.title}
                  <span className="ml-2 text-xs opacity-70">
                    ({columnItems.length})
                  </span>
                </h2>
              </div>

              {/* Column Content (Droppable) */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto bg-white rounded-b-xl border border-stone-200 ${
                      snapshot.isDraggingOver ? "bg-stone-50" : ""
                    }`}
                  >
                    {/* Quick Add Button */}
                    <div className="mb-3">
                      <button
                        onClick={() =>
                          setShowEditableCard(
                            (prev: Record<string, boolean>) => ({
                              ...prev,
                              [column.id]: true,
                            }),
                          )
                        }
                        className="w-full p-3 border border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add</span>
                      </button>
                    </div>

                    {/* Editable Card */}
                    {showEditableCard[column.id] && (
                      <EditableItemCard
                        onSave={(title, description, priority) =>
                          handleEditableCardSave(
                            column.id as ItemStatus,
                            title,
                            description,
                            priority,
                          )
                        }
                        onCancel={() =>
                          setShowEditableCard(
                            (prev: Record<string, boolean>) => ({
                              ...prev,
                              [column.id]: false,
                            }),
                          )
                        }
                      />
                    )}

                    {/* Render items in column */}
                    {columnItems.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 ${snapshot.isDragging ? "opacity-50" : ""}`}
                          >
                            <ItemCard
                              item={item}
                              childCount={getChildCount(item.id)}
                              onClick={() => onItemClick(item)}
                              onDrillDown={() => onDrillDown(item)}
                              onBreakdown={() =>
                                onBreakdown(item.id, item.title)
                              }
                              onDelete={() => onDelete(item.id)}
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
  );
}
