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
      <div className="lb-scrollbar overflow-x-auto pb-1.5">
        <div
          className="grid min-w-[900px] gap-3 md:gap-3.5"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))`,
          }}
        >
          {columns.map((column, columnIndex) => {
            const columnItems = items.filter((item) => item.status === column.id);

            return (
              <div
                key={column.id}
                className="lb-rise-in flex min-h-[calc(100vh-250px)] flex-col overflow-hidden rounded-xl border border-[#d7c2a3] bg-white/80 shadow-[0_6px_20px_rgba(93,65,29,0.12)]"
                style={{ animationDelay: `${columnIndex * 45}ms` }}
              >
                <div
                  className={`${column.color} flex items-center justify-between border-b border-[#ceb38a] px-3 py-2.5`}
                >
                  <h2 className={`text-xs font-semibold uppercase tracking-wide ${column.textColor}`}>
                    {column.title}
                  </h2>
                  <span className="rounded-full border border-white/60 bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold text-[#5b4e38]">
                    {columnItems.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`lb-scrollbar flex-1 overflow-y-auto p-2.5 transition-colors ${
                        snapshot.isDraggingOver
                          ? "bg-[#fdeed9]/70"
                          : "bg-[linear-gradient(180deg,rgba(255,252,246,0.95),rgba(255,250,240,0.75))]"
                      }`}
                    >
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
                          className="group flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#cda972] bg-white/60 px-2.5 py-2 text-xs font-semibold text-[#6e522f] transition hover:-translate-y-0.5 hover:bg-white"
                        >
                          <Plus className="h-3.5 w-3.5 transition group-hover:rotate-90" />
                          Add item
                        </button>
                      </div>

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
                              className={`mb-2 transition ${
                                snapshot.isDragging
                                  ? "rotate-[1.5deg] opacity-70"
                                  : ""
                              }`}
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
      </div>
    </DragDropContext>
  );
}
