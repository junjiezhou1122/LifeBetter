import { Calendar, Clock, AlertCircle } from 'lucide-react';
import type { Item } from '@/types';
import { ItemBasicInfo } from './ItemBasicInfo';
import { ItemTags } from './ItemTags';
import { ItemMetaSkills } from './ItemMetaSkills';

interface ItemDetailsContentProps {
  item: Item;
  editedItem: Item;
  isEditing: boolean;
  newTag: string;
  showMetaSkillPicker: boolean;
  metaSkills: any[];
  onEditedItemChange: (item: Item) => void;
  onNewTagChange: (tag: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onAddMetaSkill: (id: string) => void;
  onRemoveMetaSkill: (id: string) => void;
  onToggleMetaSkillPicker: () => void;
}

export function ItemDetailsContent({
  item,
  editedItem,
  isEditing,
  newTag,
  showMetaSkillPicker,
  metaSkills,
  onEditedItemChange,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  onAddMetaSkill,
  onRemoveMetaSkill,
  onToggleMetaSkillPicker
}: ItemDetailsContentProps) {
  return (
    <div className="space-y-6">
      <ItemBasicInfo
        item={item}
        editedItem={editedItem}
        isEditing={isEditing}
        onEditedItemChange={onEditedItemChange}
      />

      <ItemTags
        item={item}
        editedItem={editedItem}
        isEditing={isEditing}
        newTag={newTag}
        onEditedItemChange={onEditedItemChange}
        onNewTagChange={onNewTagChange}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />

      <ItemMetaSkills
        item={item}
        editedItem={editedItem}
        isEditing={isEditing}
        showMetaSkillPicker={showMetaSkillPicker}
        metaSkills={metaSkills}
        onEditedItemChange={onEditedItemChange}
        onAddMetaSkill={onAddMetaSkill}
        onRemoveMetaSkill={onRemoveMetaSkill}
        onToggleMetaSkillPicker={onToggleMetaSkillPicker}
      />

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
              onChange={(e) => onEditedItemChange({ ...editedItem, estimatedHours: parseFloat(e.target.value) || undefined })}
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
              onChange={(e) => onEditedItemChange({ ...editedItem, actualHours: parseFloat(e.target.value) || undefined })}
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

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
          <Calendar className="w-3 h-3 inline mr-1" />
          Due Date
        </label>
        {isEditing ? (
          <input
            type="date"
            value={editedItem.dueDate || ''}
            onChange={(e) => onEditedItemChange({ ...editedItem, dueDate: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        ) : (
          <p className="text-sm text-stone-700">
            {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : <span className="text-stone-400">No due date</span>}
          </p>
        )}
      </div>

      {(((item.blockedBy ?? []).length > 0) || ((item.blocking ?? []).length > 0)) && (
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Dependencies
          </label>
          {(item.blockedBy ?? []).length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-red-600 font-medium mb-1">Blocked by {(item.blockedBy ?? []).length} item(s)</p>
            </div>
          )}
          {(item.blocking ?? []).length > 0 && (
            <div>
              <p className="text-xs text-amber-600 font-medium mb-1">Blocking {(item.blocking ?? []).length} item(s)</p>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 border-t border-stone-200">
        <div className="text-xs text-stone-500 space-y-1">
          <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
          <p>Depth: Level {item.depth}</p>
        </div>
      </div>
    </div>
  );
}
