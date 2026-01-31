import { LayoutDashboard, Target, Calendar, BookOpen, Brain, ChevronRight } from 'lucide-react';

interface NavigationMenuProps {
  onNavigate: (view: 'board' | 'dashboard' | 'timeline' | 'meta-skills' | 'reflection') => void;
}

export function NavigationMenu({ onNavigate }: NavigationMenuProps) {
  return (
    <div className="border-b border-stone-200 bg-stone-50">
      <button
        onClick={() => onNavigate('dashboard')}
        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100"
      >
        <LayoutDashboard className="w-5 h-5" />
        <div className="flex-1">
          <div className="font-medium text-sm">Dashboard</div>
          <div className="text-xs text-stone-500">Overview & statistics</div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </button>

      <button
        onClick={() => onNavigate('board')}
        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
      >
        <Target className="w-5 h-5" />
        <div className="flex-1">
          <div className="font-medium text-sm">Board</div>
          <div className="text-xs text-stone-500">Manage your items</div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </button>

      <button
        onClick={() => onNavigate('timeline')}
        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
      >
        <Calendar className="w-5 h-5" />
        <div className="flex-1">
          <div className="font-medium text-sm">Timeline</div>
          <div className="text-xs text-stone-500">View activity history</div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </button>

      <button
        onClick={() => onNavigate('reflection')}
        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
      >
        <BookOpen className="w-5 h-5" />
        <div className="flex-1">
          <div className="font-medium text-sm">Daily Reflection</div>
          <div className="text-xs text-stone-500">Track your growth</div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </button>

      <button
        onClick={() => onNavigate('meta-skills')}
        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-stone-700 hover:bg-stone-100 border-t border-stone-200"
      >
        <Brain className="w-5 h-5" />
        <div className="flex-1">
          <div className="font-medium text-sm">Meta-Skills</div>
          <div className="text-xs text-stone-500">Browse & manage skills</div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </button>
    </div>
  );
}
