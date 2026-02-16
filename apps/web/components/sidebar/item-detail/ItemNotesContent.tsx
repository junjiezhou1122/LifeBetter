import { FileText, Edit3, Eye, Save, ListTree } from 'lucide-react';
import { useMemo, useState } from 'react';
import { renderMarkdown } from './MarkdownRenderer';
import type { Item } from '@/types';

type NotesMode = 'edit' | 'preview';

interface ItemNotesContentProps {
  editedItem: Item;
  notesMode: NotesMode;
  isEditing: boolean;
  onEditedItemChange: (item: Item) => void;
  onNotesModeChange: (mode: NotesMode) => void;
  onSave: () => void;
}

export function ItemNotesContent({
  editedItem,
  notesMode,
  isEditing,
  onEditedItemChange,
  onNotesModeChange,
  onSave
}: ItemNotesContentProps) {
  const sessionBlocks = useMemo(() => {
    const raw = editedItem.notes || '';
    const parts = raw
      .split('\n\n---\n\n')
      .map((part) => part.trim())
      .filter(Boolean);

    return parts.map((content, index) => {
      const headingLine = content
        .split('\n')
        .find((line) => line.startsWith('## AI Solve Session'));
      const title = headingLine
        ? headingLine.replace(/^##\s*/, '').trim()
        : `Note ${index + 1}`;

      return {
        id: `${index}-${title}`,
        title,
        content,
      };
    });
  }, [editedItem.notes]);

  const [activeSessionId, setActiveSessionId] = useState<string>('');

  const activeSession =
    sessionBlocks.find((block) => block.id === activeSessionId) || sessionBlocks[sessionBlocks.length - 1];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-500 uppercase">
          <FileText className="w-3 h-3 inline mr-1" />
          Markdown Notes
        </label>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          <button
            onClick={() => onNotesModeChange('edit')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              notesMode === 'edit'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-3 h-3 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => onNotesModeChange('preview')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              notesMode === 'preview'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {notesMode === 'edit' ? (
          <div className="h-full flex flex-col">
            <textarea
              value={editedItem.notes || ''}
              onChange={(e) => {
                onEditedItemChange({ ...editedItem, notes: e.target.value });
              }}
              placeholder="# Notes

## Tasks
- [ ] Task 1
- [ ] Task 2

## Ideas
- Idea 1
- Idea 2

## References
- Link 1
- Link 2

**Bold text** and *italic text*
`code snippet`"
              className="w-full h-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm resize-none"
            />
            <div className="mt-2 text-xs text-stone-500">
              Supports: # headers, - lists, - [ ] checkboxes, **bold**, *italic*, `code`
            </div>
          </div>
        ) : (
          <div className="h-full border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
            {editedItem.notes ? (
              <div className="grid h-full min-h-0 grid-cols-[11rem_1fr]">
                <div className="border-r border-stone-200 bg-stone-100/70 p-2">
                  <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                    <ListTree className="h-3 w-3" />
                    Note Entries
                  </div>
                  <div className="lb-scrollbar space-y-1 overflow-y-auto pr-1">
                    {sessionBlocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => setActiveSessionId(block.id)}
                        className={`w-full rounded-md px-2 py-1.5 text-left text-[11px] transition-colors ${
                          block.id === activeSession?.id
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-600 hover:bg-white/80'
                        }`}
                      >
                        {block.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lb-scrollbar overflow-y-auto p-4">
                  <div className="prose prose-sm max-w-none">
                    {renderMarkdown(activeSession?.content || editedItem.notes)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-stone-400 italic">
                No notes yet. Switch to Edit mode to add notes.
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing && notesMode === 'edit' && (
        <button
          onClick={onSave}
          className="w-full px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Notes
        </button>
      )}
    </div>
  );
}
