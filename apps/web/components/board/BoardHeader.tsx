import { ChevronLeft, Menu } from "lucide-react";
import { SearchBar } from "../search/SearchBar";
import type { NavigationItem } from "@/types";

interface BoardHeaderProps {
  navigationStack: NavigationItem[];
  isRootLevel: boolean;
  leftSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onBreadcrumbClick: (index: number) => void;
  onBack: () => void;
  onSearchResultClick: (itemId: string) => void;
}

export function BoardHeader({
  navigationStack,
  isRootLevel,
  leftSidebarOpen,
  onToggleSidebar,
  onBreadcrumbClick,
  onBack,
  onSearchResultClick,
}: BoardHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle Button */}
          {!leftSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center gap-2 px-3 py-2 bg-stone-100 text-stone-700 font-medium rounded-lg hover:bg-stone-200 transition-colors mr-4"
              title="Open Sidebar"
            >
              <Menu className="w-4 h-4" />
              <span className="text-sm">Menu</span>
            </button>
          )}

          {/* Breadcrumb Items */}
          {navigationStack.map((nav, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-stone-400">/</span>}
              <button
                onClick={() => onBreadcrumbClick(index)}
                className={`text-sm transition-colors ${
                  index === navigationStack.length - 1
                    ? "text-stone-900 font-medium"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {nav.title}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar onResultClick={onSearchResultClick} />
      </div>

      {/* Back Button (if not at root) */}
      {!isRootLevel && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      )}
    </div>
  );
}
