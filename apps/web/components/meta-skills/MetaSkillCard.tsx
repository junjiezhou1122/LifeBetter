import { Brain, Edit2, Trash2 } from 'lucide-react';

interface MetaSkill {
  id: string;
  name: string;
  description: string;
  examples: string[];
  timesApplied: number;
  timesSuccessful: number;
  effectiveness: number;
  createdAt: string;
  updatedAt: string;
  source: 'discovered' | 'imported' | 'system';
  isActive: boolean;
  personalNotes?: string;
}

interface MetaSkillCardProps {
  skill: MetaSkill;
  onDelete: (id: string) => void;
}

export function MetaSkillCard({ skill, onDelete }: MetaSkillCardProps) {
  const effectiveness = skill.timesApplied > 0
    ? Math.round((skill.timesSuccessful / skill.timesApplied) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-stone-900 text-base">
            {skill.name}
          </h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {}}
            className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(skill.id)}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-stone-600 mb-4 line-clamp-3 leading-relaxed">
        {skill.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span>{skill.timesApplied} uses</span>
          <span className={`font-semibold ${
            effectiveness >= 70 ? 'text-green-600' :
            effectiveness >= 40 ? 'text-amber-600' :
            'text-stone-500'
          }`}>
            {effectiveness}% success
          </span>
        </div>
      </div>
    </div>
  );
}
