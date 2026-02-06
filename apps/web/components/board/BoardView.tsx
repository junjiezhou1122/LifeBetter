import { BoardHeader } from "./BoardHeader";
import { KanbanBoard } from "./KanbanBoard";
import { DashboardInline } from "../dashboard/DashboardInline";
import { MetaSkillsInline } from "../meta-skills/MetaSkillsInline";
import { TimelineInline } from "../timeline/TimelineInline";
import { ReflectionInline } from "../reflection/ReflectionInline";
import type { DropResult } from "@hello-pangea/dnd";
import type { Item, NavigationItem, Column, ItemStatus } from "@/types";

type ViewType = "board" | "dashboard" | "timeline" | "meta-skills" | "reflection";

interface BoardViewProps {
  currentView: ViewType;
  navigationStack: NavigationItem[];
  isRootLevel: boolean;
  leftSidebarOpen: boolean;
  items: Item[];
  columns: Column[];
  getChildCount: (itemId: string) => number;
  onToggleSidebar: () => void;
  onBreadcrumbClick: (index: number) => void;
  onBack: () => void;
  onSearchResultClick: (itemId: string) => void;
  onItemClick: (item: Item) => void;
  onDrillDown: (item: Item) => void;
  onBreakdown: (itemId: string, title: string) => void;
  onDelete: (itemId: string) => void;
  onAddItem: (title: string, description: string, priority: string, status?: ItemStatus) => Promise<void>;
  onDragEnd: (result: DropResult) => void;
}

export function BoardView({
  currentView,
  navigationStack,
  isRootLevel,
  leftSidebarOpen,
  items,
  columns,
  getChildCount,
  onToggleSidebar,
  onBreadcrumbClick,
  onBack,
  onSearchResultClick,
  onItemClick,
  onDrillDown,
  onBreakdown,
  onDelete,
  onAddItem,
  onDragEnd
}: BoardViewProps) {
  return (
    <div
      className={`relative flex-1 transition-all duration-300 ${
        leftSidebarOpen ? "ml-[19rem]" : "ml-0"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,171,108,0.22),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,251,243,0.9),transparent)]" />

      {currentView === "dashboard" && <DashboardInline />}

      {currentView === "meta-skills" && <MetaSkillsInline />}

      {currentView === "timeline" && <TimelineInline />}

      {currentView === "reflection" && <ReflectionInline />}

      {currentView === "board" && (
        <div className="relative h-full overflow-y-auto px-3 pb-4 pt-3 md:px-4 md:pb-5 md:pt-3.5">
          <BoardHeader
            navigationStack={navigationStack}
            isRootLevel={isRootLevel}
            leftSidebarOpen={leftSidebarOpen}
            onToggleSidebar={onToggleSidebar}
            onBreadcrumbClick={onBreadcrumbClick}
            onBack={onBack}
            onSearchResultClick={onSearchResultClick}
          />

          <div className="rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(160deg,rgba(255,252,247,0.9),rgba(251,240,219,0.86))] p-2 shadow-[0_10px_28px_rgba(114,78,25,0.14)] md:p-2.5">
            <KanbanBoard
              items={items}
              columns={columns}
              getChildCount={getChildCount}
              onItemClick={onItemClick}
              onDrillDown={onDrillDown}
              onBreakdown={onBreakdown}
              onDelete={onDelete}
              onAddItem={onAddItem}
              onDragEnd={onDragEnd}
            />
          </div>
        </div>
      )}
    </div>
  );
}
