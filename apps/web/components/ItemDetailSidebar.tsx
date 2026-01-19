'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, AlertCircle, Save, Brain, Plus } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description?: string;
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

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
        <h2 className="text-lg font-semibold text-stone-900">Item Details</h2>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-900 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
              className="w-full px-3 py-2 text-base border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
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
              placeholder="Add a description..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none"
              rows={4}
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
                className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-stone-200 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-300 transition-colors"
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
                className="w-full px-3 py-1.5 bg-stone-200 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-300 transition-colors flex items-center justify-center gap-2"
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
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
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
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
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
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 transition-colors"
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
              className="flex-1 px-4 py-2 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
