import { FileText, Edit3, Eye, Save } from 'lucide-react';
import { renderMarkdown } from './MarkdownRenderer';
import type { Item } from '@/types';

type NotesMode = 'edit' | 'preview';

interface ItemNotesContentProps {
  item: Item;
  editedItem: Item;
  notesMode: NotesMode;
  isEditing: boolean;
  onEditedItemChange: (item: Item) => void;
  onNotesModeChange: (mode: NotesMode) => void;
  onSave: () => void;
}

export function ItemNotesContent({
  item,
  editedItem,
  notesMode,
  isEditing,
  onEditedItemChange,
  onNotesModeChange,
  onSave
}: ItemNotesContentProps) {
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
          <div className="h-full border border-stone-200 rounded-lg p-4 bg-stone-50 overflow-y-auto">
            {editedItem.notes ? (
              <div className="prose prose-sm max-w-none">
                {renderMarkdown(editedItem.notes)}
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
