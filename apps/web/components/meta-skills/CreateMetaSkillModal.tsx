import { useState } from 'react';

type MetaSkillWorkflow =
  | { type: 'ai-breakdown'; aiPrompt?: string }
  | {
      type: 'template';
      template?: Array<{
        title: string;
        description?: string;
        estimatedHours?: number;
      }>;
    }
  | { type: 'ai-auto-solve'; aiPrompt?: string };

interface MetaSkill {
  id: string;
  name: string;
  description: string;
  examples: string[];
  workflow?: MetaSkillWorkflow;
  timesApplied: number;
  timesSuccessful: number;
  effectiveness: number;
  createdAt: string;
  updatedAt: string;
  source: 'discovered' | 'imported' | 'system';
  isActive: boolean;
  personalNotes?: string;
}

interface CreateMetaSkillModalProps {
  onClose: () => void;
  onCreated: (skill: MetaSkill) => void;
}

export function CreateMetaSkillModal({ onClose, onCreated }: CreateMetaSkillModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [workflowType, setWorkflowType] = useState<
    'ai-breakdown' | 'template' | 'ai-auto-solve'
  >('ai-breakdown');
  const [workflowPrompt, setWorkflowPrompt] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [loading, setLoading] = useState(false);

  const parseTemplate = () => {
    const lines = templateText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.map((line) => {
      const [titlePart, descriptionPart = '', hoursPart = ''] = line
        .split('|')
        .map((part) => part.trim());
      const hoursNum = Number(hoursPart);

      return {
        title: titlePart,
        description: descriptionPart || undefined,
        estimatedHours: Number.isFinite(hoursNum) && hoursNum > 0 ? hoursNum : undefined,
      };
    }).filter((step) => step.title);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const workflow: MetaSkillWorkflow =
      workflowType === 'template'
        ? { type: 'template', template: parseTemplate() }
        : {
            type: workflowType,
            aiPrompt:
              workflowPrompt.trim() ||
              `Use "${name.trim()}" skill to solve: ${description.trim()}`,
          };

    setLoading(true);
    try {
      const res = await fetch('/api/meta-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          examples: examples.filter(ex => ex.trim()),
          workflow
        })
      });

      if (res.ok) {
        const newSkill = await res.json();
        onCreated(newSkill);
      }
    } catch (error) {
      console.error('Failed to create meta-skill:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#dbc9ad] bg-[linear-gradient(180deg,#fffef9,#fff8ec)] shadow-[0_18px_44px_rgba(81,57,28,0.28)]">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-[#dec9a8] bg-[linear-gradient(120deg,#fff7ea,#f8e9d0)] px-5 py-4">
            <h2 className="lb-display text-xl font-semibold text-[#2e2418]">Create Meta-Skill</h2>
            <p className="mt-1 text-sm text-[#6f6352]">Define a reusable strategy you want to keep applying.</p>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Divide and Conquer, First Principles Thinking"
                className="lb-input w-full rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when and how to use this strategy..."
                className="lb-input w-full resize-none rounded-lg px-3 py-2 text-sm"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
                Examples (optional)
              </label>
              {examples.map((example, index) => (
                <input
                  key={index}
                  type="text"
                  value={example}
                  onChange={(e) => {
                    const newExamples = [...examples];
                    newExamples[index] = e.target.value;
                    setExamples(newExamples);
                  }}
                  placeholder={`Example ${index + 1}`}
                  className="lb-input mb-2 w-full rounded-lg px-3 py-2 text-sm"
                />
              ))}
              <button
                type="button"
                onClick={() => setExamples([...examples, ''])}
                className="text-xs font-semibold uppercase tracking-wide text-[#8a5529] transition hover:text-[#6d3e19]"
              >
                + Add example
              </button>
            </div>

            <div className="rounded-xl border border-[#dbc9ad] bg-white/80 p-3">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
                Skill Execution Mode
              </label>
              <div className="grid grid-cols-1 gap-1.5 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setWorkflowType('ai-breakdown')}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    workflowType === 'ai-breakdown'
                      ? 'border-[#d26a3b] bg-[#fbe8d5] text-[#8a5529]'
                      : 'border-[#dbc9ad] bg-white text-[#6f6352]'
                  }`}
                >
                  AI Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowType('template')}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    workflowType === 'template'
                      ? 'border-[#d26a3b] bg-[#fbe8d5] text-[#8a5529]'
                      : 'border-[#dbc9ad] bg-white text-[#6f6352]'
                  }`}
                >
                  Template Skill
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowType('ai-auto-solve')}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    workflowType === 'ai-auto-solve'
                      ? 'border-[#2f7b65] bg-[#e4f1ec] text-[#2f7b65]'
                      : 'border-[#dbc9ad] bg-white text-[#6f6352]'
                  }`}
                >
                  AI Auto Solve
                </button>
              </div>

              {workflowType === 'template' ? (
                <div className="mt-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
                    Template Steps
                  </label>
                  <textarea
                    value={templateText}
                    onChange={(e) => setTemplateText(e.target.value)}
                    placeholder={'One step per line: title | description | hours\nExample: Draft API schema | Define request/response | 1.5'}
                    className="lb-input w-full resize-none rounded-lg px-3 py-2 text-xs"
                    rows={5}
                  />
                </div>
              ) : (
                <div className="mt-3">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
                    AI Prompt (optional)
                  </label>
                  <textarea
                    value={workflowPrompt}
                    onChange={(e) => setWorkflowPrompt(e.target.value)}
                    placeholder="Define how this skill should guide AI execution..."
                    className="lb-input w-full resize-none rounded-lg px-3 py-2 text-xs"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#dec9a8] bg-[#fff3de]/70 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#dac8ab] bg-white/80 px-3 py-2 text-sm font-medium text-[#6d5f4f] transition hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="flex-1 rounded-lg bg-[#d26a3b] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#bb5a2f] disabled:cursor-not-allowed disabled:bg-[#d5c7b4]"
            >
              {loading ? 'Creating...' : 'Create Meta-Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
