'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, BookOpen } from 'lucide-react';
import { useExperiences } from '@/hooks/useExperiences';
import type { Item, ExperienceOutcome } from '@/lib/types';

interface ItemExperienceContentProps {
  item: Item;
}

export function ItemExperienceContent({ item }: ItemExperienceContentProps) {
  const { experiences, loading, createExperience } = useExperiences(item.id);
  const [showForm, setShowForm] = useState(false);
  const [outcome, setOutcome] = useState<ExperienceOutcome>('success');
  const [approach, setApproach] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [keyTurningPoint, setKeyTurningPoint] = useState('');
  const [ifRedoWouldChange, setIfRedoWouldChange] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await createExperience({
      taskId: item.id,
      task: item.title,
      approach,
      outcome,
      retrospective: {
        whatWorked,
        whatFailed,
        keyTurningPoint,
        ifRedoWouldChange,
        applicableScenarios: [],
      },
      context: {
        taskType: item.tags?.[0] || '',
        complexity: item.estimatedHours && item.estimatedHours > 4 ? 'high' : 'medium',
        domain: '',
        principlesUsed: item.principleIds || [],
      },
    });
    setSaving(false);
    setShowForm(false);
    setApproach('');
    setWhatWorked('');
    setWhatFailed('');
    setKeyTurningPoint('');
    setIfRedoWouldChange('');
  };

  const outcomeIcon = (o: ExperienceOutcome) => {
    switch (o) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const outcomeBg = (o: ExperienceOutcome) => {
    switch (o) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'partial': return 'border-amber-200 bg-amber-50';
      case 'failure': return 'border-red-200 bg-red-50';
    }
  };

  if (loading) {
    return <div className="py-4 text-center text-xs text-[#7b6e5b]">Loading experiences...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#6c5d47]" />
          <h3 className="text-sm font-semibold text-[#2f271c]">Experience Log</h3>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-[#d26a3b] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#bb5a2f]"
          >
            + Record
          </button>
        )}
      </div>

      {showForm && (
        <div className="space-y-3 rounded-xl border border-[#dbc9ad] bg-white/85 p-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">Outcome</label>
            <div className="flex gap-2">
              {(['success', 'partial', 'failure'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOutcome(o)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    outcome === o ? outcomeBg(o) : 'border-[#dbc9ad] bg-white hover:bg-[#f7ead5]'
                  }`}
                >
                  {outcomeIcon(o)}
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">Approach Used</label>
            <textarea
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder="How did you tackle this task?"
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">What Worked</label>
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="What approaches or tools were effective?"
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">What Failed</label>
            <textarea
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              placeholder="What didn't work or caused problems?"
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">Key Turning Point</label>
            <input
              value={keyTurningPoint}
              onChange={(e) => setKeyTurningPoint(e.target.value)}
              placeholder="The moment everything clicked or went wrong"
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#6c5d47]">If You Could Redo</label>
            <input
              value={ifRedoWouldChange}
              onChange={(e) => setIfRedoWouldChange(e.target.value)}
              placeholder="What would you do differently?"
              className="w-full rounded-lg border border-[#dbc9ad] bg-white px-3 py-2 text-xs text-[#2f271c] placeholder:text-[#b0a28e] focus:border-[#d26a3b] focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#d26a3b] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:bg-[#d5c7b4]"
            >
              {saving ? 'Saving...' : 'Save Experience'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[#dbc9ad] px-4 py-1.5 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f7ead5]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {experiences.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-[#dbc9ad] p-4 text-center">
          <Clock className="mx-auto mb-2 h-6 w-6 text-[#b0a28e]" />
          <p className="text-xs text-[#7b6e5b]">No experiences recorded yet.</p>
          <p className="text-[11px] text-[#b0a28e]">Record what you learned after completing this task.</p>
        </div>
      )}

      {experiences.map((exp) => (
        <div key={exp.id} className={`rounded-xl border p-3 ${outcomeBg(exp.outcome)}`}>
          <div className="mb-2 flex items-center gap-2">
            {outcomeIcon(exp.outcome)}
            <span className="text-xs font-semibold capitalize text-[#2f271c]">{exp.outcome}</span>
            <span className="ml-auto text-[11px] text-[#7b6e5b]">
              {new Date(exp.createdAt).toLocaleDateString()}
            </span>
          </div>
          {exp.approach && (
            <p className="mb-1 text-xs text-[#5d4b34]"><strong>Approach:</strong> {exp.approach}</p>
          )}
          {exp.retrospective.whatWorked && (
            <p className="mb-1 text-xs text-[#5d4b34]"><strong>Worked:</strong> {exp.retrospective.whatWorked}</p>
          )}
          {exp.retrospective.whatFailed && (
            <p className="text-xs text-[#5d4b34]"><strong>Failed:</strong> {exp.retrospective.whatFailed}</p>
          )}
        </div>
      ))}
    </div>
  );
}
