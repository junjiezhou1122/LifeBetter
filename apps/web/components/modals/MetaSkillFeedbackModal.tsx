'use client';

import { useState } from 'react';
import { CheckCircle, ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface MetaSkillFeedbackModalProps {
  itemTitle: string;
  metaSkillName: string;
  metaSkillId: string;
  onSubmit: (success: boolean) => void;
  onSkip: () => void;
}

export function MetaSkillFeedbackModal({
  itemTitle,
  metaSkillName,
  metaSkillId,
  onSubmit,
  onSkip
}: MetaSkillFeedbackModalProps) {
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (feedback !== null) {
      onSubmit(feedback);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-stone-900">Item Completed!</h2>
              <p className="text-sm text-stone-500">Quick feedback</p>
            </div>
            <button
              onClick={onSkip}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm text-stone-700 mb-2">
            You completed: <span className="font-semibold">{itemTitle}</span>
          </p>
          <p className="text-sm text-stone-600 mb-6">
            You used the <span className="font-semibold text-purple-700">{metaSkillName}</span> approach.
          </p>

          <p className="text-sm font-semibold text-stone-900 mb-4">
            Did this meta-skill help you solve the problem?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFeedback(true)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                feedback === true
                  ? 'border-green-500 bg-green-50'
                  : 'border-stone-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              <ThumbsUp className={`w-8 h-8 ${feedback === true ? 'text-green-600' : 'text-stone-400'}`} />
              <span className={`text-sm font-semibold ${feedback === true ? 'text-green-700' : 'text-stone-600'}`}>
                Yes, it helped!
              </span>
            </button>

            <button
              onClick={() => setFeedback(false)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                feedback === false
                  ? 'border-red-500 bg-red-50'
                  : 'border-stone-200 hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <ThumbsDown className={`w-8 h-8 ${feedback === false ? 'text-red-600' : 'text-stone-400'}`} />
              <span className={`text-sm font-semibold ${feedback === false ? 'text-red-700' : 'text-stone-600'}`}>
                Not really
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={feedback === null}
            className="flex-1 px-4 py-2 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
