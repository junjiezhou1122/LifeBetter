import { Brain, Lightbulb } from 'lucide-react';

interface MetaSkillSuggestion {
  metaSkillId: string;
  metaSkillName: string;
  metaSkillDescription: string;
  category: string;
  confidence: number;
  reason: string;
  successRate: number | null;
}

interface MetaSkillSuggestionsProps {
  suggestions: MetaSkillSuggestion[];
  loading: boolean;
  onUseMetaSkill: (metaSkillId: string) => void;
  onGenerateGeneric: () => void;
}

export function MetaSkillSuggestions({
  suggestions,
  loading,
  onUseMetaSkill,
  onGenerateGeneric
}: MetaSkillSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="w-full mb-8 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-semibold text-stone-900">
          AI Suggests These Approaches
        </h3>
      </div>

      {suggestions.map((suggestion) => (
        <div
          key={suggestion.metaSkillId}
          className="bg-white border-2 border-stone-200 rounded-xl p-4 hover:border-amber-300 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-stone-900 text-sm">
                {suggestion.metaSkillName}
              </h4>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {Math.round(suggestion.confidence * 100)}% match
            </span>
          </div>

          <p className="text-xs text-stone-600 mb-3 leading-relaxed">
            {suggestion.reason}
          </p>

          {suggestion.successRate !== null && (
            <p className="text-xs text-green-600 font-medium mb-3">
              ✓ {suggestion.successRate}% success rate
            </p>
          )}

          <button
            onClick={() => onUseMetaSkill(suggestion.metaSkillId)}
            disabled={loading}
            className="w-full px-3 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Generating...' : `Use ${suggestion.metaSkillName}`}
          </button>
        </div>
      ))}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-stone-100 px-2 text-stone-500">or</span>
        </div>
      </div>
    </div>
  );
}
