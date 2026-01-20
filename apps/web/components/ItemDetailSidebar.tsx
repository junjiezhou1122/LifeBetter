'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, AlertCircle, Save, Brain, Plus, FileText, Edit3, Eye } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description?: string;
  notes?: string; // Markdown notes
  parentId: string | null;
  depth: number;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  blockedBy: string[];
  blocking: string[];
  tags: string[];
  metaSkillIds: string[];
  order: number;
}

interface MetaSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  timesApplied: number;
  effectiveness: number;
}

interface ItemDetailSidebarProps {
  item: Item;
  onClose: () => void;
  onUpdate: (updates: Partial<Item>) => void;
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

export function ItemDetailSidebar({ item, onClose, onUpdate }: ItemDetailSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<Item>(item);
  const [newTag, setNewTag] = useState('');
  const [metaSkills, setMetaSkills] = useState<MetaSkill[]>([]);
  const [showMetaSkillPicker, setShowMetaSkillPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [notesMode, setNotesMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  useEffect(() => {
    // Fetch all meta-skills
    fetch('/api/meta-skills')
      .then(res => res.json())
      .then(data => setMetaSkills(data))
      .catch(err => console.error('Failed to fetch meta-skills:', err));
  }, []);

  const handleSave = () => {
    onUpdate(editedItem);
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedItem.tags.includes(newTag.trim())) {
      setEditedItem({
        ...editedItem,
        tags: [...editedItem.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedItem({
      ...editedItem,
      tags: editedItem.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddMetaSkill = (metaSkillId: string) => {
    if (!editedItem.metaSkillIds) {
      editedItem.metaSkillIds = [];
    }
    if (!editedItem.metaSkillIds.includes(metaSkillId)) {
      setEditedItem({
        ...editedItem,
        metaSkillIds: [...editedItem.metaSkillIds, metaSkillId]
      });
      setShowMetaSkillPicker(false);
    }
  };

  const handleRemoveMetaSkill = (metaSkillId: string) => {
    setEditedItem({
      ...editedItem,
      metaSkillIds: editedItem.metaSkillIds.filter(id => id !== metaSkillId)
    });
  };

  const getMetaSkillById = (id: string) => metaSkills.find(ms => ms.id === id);

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-semibold text-stone-800 mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold text-stone-900 mt-4 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold text-stone-900 mt-4 mb-3">{line.slice(2)}</h1>;
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 text-stone-700 text-sm">{line.slice(2)}</li>;
      }

      // Checkboxes
      if (line.startsWith('- [ ] ')) {
        return <div key={i} className="flex items-center gap-2 ml-4 text-sm text-stone-700"><input type="checkbox" disabled /> {line.slice(6)}</div>;
      }
      if (line.startsWith('- [x] ')) {
        return <div key={i} className="flex items-center gap-2 ml-4 text-sm text-stone-700"><input type="checkbox" checked disabled /> {line.slice(6)}</div>;
      }

      // Bold and italic
      let content = line;
      content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
      content = content.replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-stone-100 rounded text-xs">$1</code>');

      // Empty lines
      if (!line.trim()) {
        return <br key={i} />;
      }

      return <p key={i} className="text-sm text-stone-700" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[500px] bg-white border-l border-stone-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
        <h2 className="text-lg font-semibold text-stone-900">Item Details</h2>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 border-b border-stone-200 bg-white">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Details
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'notes'
              ? 'text-amber-600 border-b-2 border-amber-600'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Notes
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === 'details' ? (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedItem.title}
                  onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
                  className="w-full px-3 py-2 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              ) : (
                <h3 className="text-xl font-semibold text-stone-900">{item.title}</h3>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editedItem.description || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-stone-700 leading-relaxed">
                  {item.description || (
                    <span className="text-stone-400 italic">No description</span>
                  )}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                Priority
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  {priorities.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setEditedItem({ ...editedItem, priority: p.value })}
                      className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                        editedItem.priority === p.value
                          ? `${p.color} text-white shadow-sm`
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                  item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.priority}
                </span>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editedItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Meta-Skills */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                <Brain className="w-3 h-3 inline mr-1" />
                Applied Meta-Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editedItem.metaSkillIds || []).map((skillId) => {
                  const skill = getMetaSkillById(skillId);
                  if (!skill) return null;
                  return (
                    <span
                      key={skillId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium"
                    >
                      <Brain className="w-3 h-3" />
                      {skill.name}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveMetaSkill(skillId)}
                          className="ml-1 text-purple-400 hover:text-purple-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
              {isEditing && (
                <div className="relative">
                  <button
                    onClick={() => setShowMetaSkillPicker(!showMetaSkillPicker)}
                    className="w-full px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Meta-Skill
                  </button>

                  {showMetaSkillPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                      {metaSkills.filter(ms => !editedItem.metaSkillIds?.includes(ms.id)).length === 0 ? (
                        <div className="p-4 text-center text-sm text-stone-500">
                          No more meta-skills available
                        </div>
                      ) : (
                        metaSkills
                          .filter(ms => !editedItem.metaSkillIds?.includes(ms.id))
                          .map(skill => (
                            <button
                              key={skill.id}
                              onClick={() => handleAddMetaSkill(skill.id)}
                              className="w-full px-3 py-2 text-left hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
                            >
                              <div className="font-medium text-sm text-stone-900">{skill.name}</div>
                              <div className="text-xs text-stone-500 truncate">{skill.description}</div>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Time Tracking */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Estimated
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedItem.estimatedHours || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, estimatedHours: parseFloat(e.target.value) || undefined })}
                    placeholder="Hours"
                    className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-sm text-stone-700">
                    {item.estimatedHours ? `${item.estimatedHours}h` : <span className="text-stone-400">-</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Actual
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedItem.actualHours || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, actualHours: parseFloat(e.target.value) || undefined })}
                    placeholder="Hours"
                    className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-sm text-stone-700">
                    {item.actualHours ? `${item.actualHours}h` : <span className="text-stone-400">-</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedItem.dueDate || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-sm text-stone-700">
                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : <span className="text-stone-400">No due date</span>}
                </p>
              )}
            </div>

            {/* Dependencies */}
            {(item.blockedBy.length > 0 || item.blocking.length > 0) && (
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Dependencies
                </label>
                {item.blockedBy.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-red-600 font-medium mb-1">Blocked by {item.blockedBy.length} item(s)</p>
                  </div>
                )}
                {item.blocking.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-600 font-medium mb-1">Blocking {item.blocking.length} item(s)</p>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t border-stone-200">
              <div className="text-xs text-stone-500 space-y-1">
                <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                <p>Depth: Level {item.depth}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Notes Tab */
          <div className="space-y-4 h-full flex flex-col">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-500 uppercase">
                <FileText className="w-3 h-3 inline mr-1" />
                Markdown Notes
              </label>
              <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setNotesMode('edit')}
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
                  onClick={() => setNotesMode('preview')}
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

            {/* Notes Content */}
            <div className="flex-1 min-h-0">
              {notesMode === 'edit' ? (
                <div className="h-full flex flex-col">
                  <textarea
                    value={editedItem.notes || ''}
                    onChange={(e) => {
                      setEditedItem({ ...editedItem, notes: e.target.value });
                      setIsEditing(true);
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

            {/* Quick Save for Notes */}
            {isEditing && notesMode === 'edit' && (
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Notes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {activeTab === 'details' && (
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Edit Item
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditedItem(item);
                  setIsEditing(false);
                }}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
