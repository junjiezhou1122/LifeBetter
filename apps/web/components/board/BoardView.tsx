import { BoardHeader } from "./BoardHeader";
import { KanbanBoard } from "./KanbanBoard";
import { DashboardInline } from "../dashboard/DashboardInline";
import { MetaSkillsInline } from "../meta-skills/MetaSkillsInline";
import { TimelineInline } from "../timeline/TimelineInline";
import { ReflectionInline } from "../reflection/ReflectionInline";
import type { Item, NavigationItem, Column } from "@/types";

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
  onAddItem: (title: string, description: string, priority: string, status?: any) => Promise<void>;
  onDragEnd: (result: any) => void;
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
      className={`flex-1 transition-all duration-300 ${
        leftSidebarOpen ? "ml-80" : "ml-0"
      }`}
    >
      {currentView === "dashboard" && <DashboardInline />}

      {currentView === "meta-skills" && <MetaSkillsInline />}

      {currentView === "timeline" && <TimelineInline />}

      {currentView === "reflection" && <ReflectionInline />}

      {currentView === "board" && (
        <div className="p-6">
          <BoardHeader
            navigationStack={navigationStack}
            isRootLevel={isRootLevel}
            leftSidebarOpen={leftSidebarOpen}
            onToggleSidebar={onToggleSidebar}
            onBreadcrumbClick={onBreadcrumbClick}
            onBack={onBack}
            onSearchResultClick={onSearchResultClick}
          />

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
      )}
    </div>
  );
}
