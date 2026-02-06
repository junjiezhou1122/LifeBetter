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
    <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 transition-all hover:shadow-[0_8px_18px_rgba(95,67,31,0.12)]">
      <div className="mb-2.5 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-[18px] w-[18px] text-[#b35a2f]" />
          <h3 className="text-sm font-semibold text-[#2f271c]">
            {skill.name}
          </h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {}}
            className="rounded-md p-1 text-[#8c7c66] transition-colors hover:bg-[#f4e6d1] hover:text-[#8a5529]"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(skill.id)}
            className="rounded-md p-1 text-[#8c7c66] transition-colors hover:bg-[#f8e5e2] hover:text-[#a63b31]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-[#6e604f]">
        {skill.description}
      </p>

      <div className="flex items-center justify-between border-t border-[#eadbc4] pt-2">
        <div className="flex items-center gap-3 text-[11px] text-[#7f725e]">
          <span>{skill.timesApplied} uses</span>
          <span className={`font-semibold ${
            effectiveness >= 70 ? 'text-[#2f7b65]' :
            effectiveness >= 40 ? 'text-[#8a5b26]' :
            'text-[#7f725e]'
          }`}>
            {effectiveness}% success
          </span>
        </div>
      </div>
    </div>
  );
}
