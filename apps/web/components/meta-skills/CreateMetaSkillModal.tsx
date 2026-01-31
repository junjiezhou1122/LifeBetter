import { useState } from 'react';

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

interface CreateMetaSkillModalProps {
  onClose: () => void;
  onCreated: (skill: MetaSkill) => void;
}

export function CreateMetaSkillModal({ onClose, onCreated }: CreateMetaSkillModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/meta-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          examples: examples.filter(ex => ex.trim())
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-xl font-semibold text-stone-900">Create Meta-Skill</h2>
            <p className="text-sm text-stone-500 mt-1">A universal problem-solving principle</p>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Divide and Conquer, First Principles Thinking"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe when and how to use this strategy..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
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
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
                />
              ))}
              <button
                type="button"
                onClick={() => setExamples([...examples, ''])}
                className="text-sm text-stone-600 hover:text-stone-900"
              >
                + Add example
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-stone-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="flex-1 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Meta-Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
