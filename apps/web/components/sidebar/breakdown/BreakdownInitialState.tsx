import { Sparkles, Loader2 } from 'lucide-react';
import { MetaSkillSuggestions } from './MetaSkillSuggestions';

interface MetaSkillSuggestion {
  metaSkillId: string;
  metaSkillName: string;
  metaSkillDescription: string;
  category: string;
  confidence: number;
  reason: string;
  successRate: number | null;
}

interface BreakdownInitialStateProps {
  metaSkillSuggestions: MetaSkillSuggestion[];
  loading: boolean;
  onUseMetaSkill: (metaSkillId: string) => void;
  onGenerateGeneric: () => void;
}

export function BreakdownInitialState({
  metaSkillSuggestions,
  loading,
  onUseMetaSkill,
  onGenerateGeneric
}: BreakdownInitialStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-10">
      {metaSkillSuggestions.length > 0 && (
        <MetaSkillSuggestions
          suggestions={metaSkillSuggestions}
          loading={loading}
          onUseMetaSkill={onUseMetaSkill}
          onGenerateGeneric={onGenerateGeneric}
        />
      )}

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4dab4]">
        <Sparkles className="h-5 w-5 text-[#a95a2f]" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-[#2f271c]">
        AI Breakdown
      </h3>
      <p className="mb-5 max-w-xs text-center text-xs leading-relaxed text-[#7a6b57]">
        {metaSkillSuggestions.length > 0
          ? 'Or generate a generic breakdown without a specific strategy'
          : 'Let AI break this into smaller, actionable sub-items'}
      </p>
      <button
        onClick={onGenerateGeneric}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#d26a3b] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#bb5a2f] disabled:cursor-not-allowed disabled:bg-[#d5c7b4]"
        aria-label="Generate AI breakdown"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generic Breakdown
          </>
        )}
      </button>
    </div>
  );
}
