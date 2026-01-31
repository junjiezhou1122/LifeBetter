import { Sparkles, Loader2 } from 'lucide-react';
import { MetaSkillSuggestions } from './MetaSkillSuggestions';

interface BreakdownInitialStateProps {
  metaSkillSuggestions: any[];
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
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {metaSkillSuggestions.length > 0 && (
        <MetaSkillSuggestions
          suggestions={metaSkillSuggestions}
          loading={loading}
          onUseMetaSkill={onUseMetaSkill}
          onGenerateGeneric={onGenerateGeneric}
        />
      )}

      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-base font-semibold text-stone-900 mb-2">
        AI Breakdown
      </h3>
      <p className="text-sm text-stone-500 text-center mb-8 max-w-xs leading-relaxed">
        {metaSkillSuggestions.length > 0
          ? 'Or generate a generic breakdown without a specific strategy'
          : 'Let AI break this into smaller, actionable sub-items'}
      </p>
      <button
        onClick={onGenerateGeneric}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
        aria-label="Generate AI breakdown"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generic Breakdown
          </>
        )}
      </button>
    </div>
  );
}
