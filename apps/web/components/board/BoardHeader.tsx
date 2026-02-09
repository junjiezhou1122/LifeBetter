import { ChevronLeft, Compass, Layers3, Menu } from "lucide-react";
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
  const current = navigationStack[navigationStack.length - 1];

  return (
    <div className="mb-3 lb-rise-in">
      <div className="rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(120deg,#fffaf0,#f5ebd7)] px-2.5 py-2 shadow-[0_8px_22px_rgba(110,80,34,0.11)] md:px-3.5 md:py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            {!leftSidebarOpen && (
              <button
                onClick={onToggleSidebar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ceb58f] bg-white/80 px-2 py-1.5 text-xs font-semibold text-[#4f3f27] transition hover:-translate-y-0.5 hover:bg-white"
                title="Open Sidebar"
              >
                <Menu className="h-3 w-3" />
                Menu
              </button>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f7dfbc] px-2 py-0.75 text-[10px] font-semibold uppercase tracking-wide text-[#6d471f]">
              <Compass className="h-2.5 w-2.5" />
              {isRootLevel ? "Root Level" : `Depth ${current?.depth ?? 0}`}
            </span>

            <h1 className="lb-display max-w-[320px] truncate text-base font-semibold leading-tight text-[#2d2114] md:text-lg">
              {current?.title || "LifeBetter Board"}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {!isRootLevel && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 rounded-lg border border-[#d8c6a8] bg-white/80 px-2 py-1.5 text-[11px] font-medium text-[#4f5f68] transition hover:bg-white"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>
            )}
            <span className="hidden items-center gap-1 rounded-lg border border-[#d8c6a8] bg-white/70 px-2 py-1.5 text-[11px] font-medium text-[#5d6a71] md:inline-flex">
              <Layers3 className="h-3 w-3" />
              {navigationStack.length} levels
            </span>
          </div>
        </div>

        <div className="mt-1.5 flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {navigationStack.map((nav, index) => (
              <button
                key={`${nav.title}-${index}`}
                onClick={() => onBreadcrumbClick(index)}
                className={`rounded-full px-2 py-0.75 text-[10px] font-semibold transition ${
                  index === navigationStack.length - 1
                    ? "bg-[#d26a3b] text-white shadow-[0_5px_12px_rgba(210,106,59,0.32)]"
                    : "lb-chip hover:-translate-y-0.5 hover:bg-white"
                }`}
              >
                {index + 1}. {nav.title}
              </button>
            ))}
          </div>
          <SearchBar
            onResultClick={onSearchResultClick}
            className="max-w-none lg:max-w-[420px]"
          />
        </div>
      </div>
    </div>
  );
}
