import { LayoutDashboard, Target, Calendar, BookOpen, Brain, ChevronRight } from 'lucide-react';

interface NavigationMenuProps {
  onNavigate: (view: 'board' | 'dashboard' | 'timeline' | 'meta-skills' | 'reflection') => void;
}

export function NavigationMenu({ onNavigate }: NavigationMenuProps) {
  const itemClass =
    "w-full px-3 py-2 text-left flex items-center gap-2.5 transition rounded-lg text-[#5d4b34] hover:bg-[#f7ead5]";

  return (
    <div className="border-b border-[#dec9a8] bg-[#fff3de]/70 p-2">
      <button
        onClick={() => onNavigate('dashboard')}
        className={itemClass}
      >
        <LayoutDashboard className="h-4 w-4" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Dashboard</div>
          <div className="text-[11px] text-[#7a6b57]">Overview & statistics</div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[#8e7e67]" />
      </button>

      <button
        onClick={() => onNavigate('board')}
        className={itemClass}
      >
        <Target className="h-4 w-4" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Board</div>
          <div className="text-[11px] text-[#7a6b57]">Manage your items</div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[#8e7e67]" />
      </button>

      <button
        onClick={() => onNavigate('timeline')}
        className={itemClass}
      >
        <Calendar className="h-4 w-4" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Timeline</div>
          <div className="text-[11px] text-[#7a6b57]">View activity history</div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[#8e7e67]" />
      </button>

      <button
        onClick={() => onNavigate('reflection')}
        className={itemClass}
      >
        <BookOpen className="h-4 w-4" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Daily Reflection</div>
          <div className="text-[11px] text-[#7a6b57]">Track your growth</div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[#8e7e67]" />
      </button>

      <button
        onClick={() => onNavigate('meta-skills')}
        className={itemClass}
      >
        <Brain className="h-4 w-4" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Meta-Skills</div>
          <div className="text-[11px] text-[#7a6b57]">Browse & manage skills</div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[#8e7e67]" />
      </button>
    </div>
  );
}
