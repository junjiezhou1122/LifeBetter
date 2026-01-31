import { Brain, X, Plus } from "lucide-react";
import type { Item, MetaSkill } from "@/types";

interface ItemMetaSkillsProps {
  item: Item;
  editedItem: Item;
  isEditing: boolean;
  showMetaSkillPicker: boolean;
  metaSkills: MetaSkill[];
  onEditedItemChange: (item: Item) => void;
  onAddMetaSkill: (id: string) => void;
  onRemoveMetaSkill: (id: string) => void;
  onToggleMetaSkillPicker: () => void;
}

export function ItemMetaSkills({
  item,
  editedItem,
  isEditing,
  showMetaSkillPicker,
  metaSkills,
  onEditedItemChange,
  onAddMetaSkill,
  onRemoveMetaSkill,
  onToggleMetaSkillPicker,
}: ItemMetaSkillsProps) {
  const getMetaSkillById = (id: string) =>
    metaSkills.find((ms) => ms.id === id);

  return (
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
                  onClick={() => onRemoveMetaSkill(skillId)}
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
            onClick={onToggleMetaSkillPicker}
            className="w-full px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Meta-Skill
          </button>

          {showMetaSkillPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {metaSkills.filter(
                (ms) => !editedItem.metaSkillIds?.includes(ms.id),
              ).length === 0 ? (
                <div className="p-4 text-center text-sm text-stone-500">
                  No more meta-skills available
                </div>
              ) : (
                metaSkills
                  .filter((ms) => !editedItem.metaSkillIds?.includes(ms.id))
                  .map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => onAddMetaSkill(skill.id)}
                      className="w-full px-3 py-2 text-left hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-stone-900">
                        {skill.name}
                      </div>
                      <div className="text-xs text-stone-500 truncate">
                        {skill.description}
                      </div>
                    </button>
                  ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
