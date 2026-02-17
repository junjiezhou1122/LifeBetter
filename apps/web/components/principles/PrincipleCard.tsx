import { Shield, TrendingUp, Zap, Code } from 'lucide-react';
import type { Principle } from '@/lib/types';

interface PrincipleCardProps {
  principle: Principle;
  onEdit?: (principle: Principle) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}

export function PrincipleCard({ principle, onEdit, onToggleActive }: PrincipleCardProps) {
  const confidencePercent = Math.round(principle.confidence * 100);
  const confidenceColor =
    confidencePercent >= 70 ? 'bg-green-500' :
    confidencePercent >= 40 ? 'bg-amber-500' : 'bg-red-400';

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        principle.isActive
          ? 'border-[#dbc9ad] bg-white/90 shadow-[0_4px_12px_rgba(95,67,31,0.08)]'
          : 'border-[#e8dcc9] bg-[#f7f0e4]/50 opacity-60'
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-[#d26a3b]" />
          <h3 className="text-sm font-semibold text-[#2f271c]">{principle.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#f7ead5] px-2 py-0.5 text-[10px] font-semibold text-[#6c5d47]">
            v{principle.version}
          </span>
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(principle.id, !principle.isActive)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                principle.isActive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {principle.isActive ? 'Active' : 'Inactive'}
            </button>
          )}
        </div>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-[#5d4b34]">{principle.description}</p>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-[#8e7e67]" />
            <span className="text-[11px] font-medium text-[#6c5d47]">Confidence</span>
          </div>
          <span className="text-[11px] font-semibold text-[#2f271c]">{confidencePercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8dcc9]">
          <div className={`h-full rounded-full ${confidenceColor} transition-all`} style={{ width: `${confidencePercent}%` }} />
        </div>
      </div>

      {/* How to apply — the actual skill instruction */}
      <div className="mb-3 rounded-lg border border-[#e8dcc9] bg-[#faf6ef] p-2.5">
        <div className="mb-1 flex items-center gap-1">
          <Zap className="h-3 w-3 text-[#d26a3b]" />
          <span className="text-[11px] font-semibold text-[#6c5d47]">Agent Instructions</span>
        </div>
        <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#5d4b34]">
          {principle.howToApply}
        </p>
      </div>

      {/* Triggers */}
      {(principle.triggers.keywords.length > 0 || principle.triggers.taskTypes.length > 0) && (
        <div className="mb-3 flex flex-wrap gap-1">
          {principle.triggers.taskTypes.map((t) => (
            <span key={t} className="rounded-full bg-[#d26a3b]/10 px-2 py-0.5 text-[10px] font-medium text-[#d26a3b]">
              {t}
            </span>
          ))}
          {principle.triggers.keywords.map((k) => (
            <span key={k} className="rounded-full bg-[#f7ead5] px-2 py-0.5 text-[10px] font-medium text-[#6c5d47]">
              {k}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-[#8e7e67]">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>{principle.applications.length} applications</span>
        </div>
        <span className="capitalize">{principle.source}</span>
      </div>

      {onEdit && (
        <button
          onClick={() => onEdit(principle)}
          className="mt-2 w-full rounded-lg border border-[#dbc9ad] py-1.5 text-[11px] font-semibold text-[#6c5d47] transition hover:bg-[#f7ead5]"
        >
          Edit Skill
        </button>
      )}
    </div>
  );
}
