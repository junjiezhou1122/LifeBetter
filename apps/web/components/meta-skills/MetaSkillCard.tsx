import { Brain, Trash2 } from 'lucide-react';

type MetaSkillWorkflow =
  | { type: 'ai-breakdown'; aiPrompt?: string }
  | {
      type: 'template';
      template?: Array<{ title: string; description?: string; estimatedHours?: number }>;
    }
  | { type: 'ai-auto-solve'; aiPrompt?: string }
  | { type: string; [key: string]: unknown };

interface MetaSkill {
  id: string;
  name: string;
  description: string;
  examples?: string[];
  workflow?: MetaSkillWorkflow;
  category?: string;
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
  const sourceColors: Record<MetaSkill['source'], string> = {
    discovered: 'bg-[#e8f1f8] text-[#2f6283] border-[#c2d8ea]',
    imported: 'bg-[#eceaf8] text-[#5240a3] border-[#d3ccf2]',
    system: 'bg-[#e9f5ef] text-[#2f7b65] border-[#b8ddcb]',
  };
  const workflowLabel =
    skill.workflow?.type === 'template'
      ? 'Template'
      : skill.workflow?.type === 'ai-auto-solve'
        ? 'Auto Solve'
        : 'Breakdown';

  return (
    <div className="group rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(180deg,#fffef9,#fff8ec)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(95,67,31,0.14)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sourceColors[skill.source]}`}>
            {skill.source}
          </span>
          <span className="rounded-full border border-[#d9c7aa] bg-[#fff3de] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7a5b34]">
            {workflowLabel}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            skill.isActive ? 'bg-[#f4dab4] text-[#7b4b22]' : 'bg-[#ece8df] text-[#7f725e]'
          }`}>
            {skill.isActive ? 'Active' : 'Paused'}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onDelete(skill.id)}
            className="rounded-md p-1 text-[#8c7c66] transition-colors hover:bg-[#f8e5e2] hover:text-[#a63b31]"
            title="Delete skill"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <Brain className="h-4 w-4 text-[#b35a2f]" />
        <h3 className="line-clamp-1 text-sm font-semibold text-[#2f271c]">{skill.name}</h3>
      </div>

      <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-[#6e604f]">
        {skill.description}
      </p>

      {skill.examples && skill.examples.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {skill.examples.slice(0, 2).map((example) => (
            <span
              key={example}
              className="rounded-md border border-[#dfcfb4] bg-[#fdf2e3] px-1.5 py-0.5 text-[10px] font-medium text-[#705a3f]"
            >
              {example}
            </span>
          ))}
        </div>
      )}

      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="font-semibold uppercase tracking-wide text-[#7a6b57]">Performance</span>
          <span
            className={`font-semibold ${
              effectiveness >= 70 ? 'text-[#2f7b65]' : effectiveness >= 40 ? 'text-[#8a5b26]' : 'text-[#7f725e]'
            }`}
          >
            {effectiveness}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#eadfc9]">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-[#d26a3b] to-[#bb5529]"
            style={{ width: `${Math.min(effectiveness, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#eadbc4] pt-2 text-[11px] text-[#7f725e]">
        <span>{skill.timesApplied} uses</span>
        <span>{skill.timesSuccessful} wins</span>
      </div>
    </div>
  );
}
