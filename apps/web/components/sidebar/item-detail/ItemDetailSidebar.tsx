'use client';

import { useState, useEffect } from 'react';
import { ItemSidebarHeader } from './ItemSidebarHeader';
import { ItemSidebarTabs, type TabType } from './ItemSidebarTabs';
import { ItemDetailsContent } from './ItemDetailsContent';
import { ItemNotesContent } from './ItemNotesContent';
import { ItemExperienceContent } from './ItemExperienceContent';
import { ItemSidebarFooter } from './ItemSidebarFooter';
import { BreakdownSidebarContent } from '../breakdown/BreakdownSidebarContent';
import type { Item, MetaSkill } from '@/types';

interface ItemDetailSidebarProps {
  item: Item;
  initialTab?: TabType;
  onClose: () => void;
  onRefresh?: () => Promise<void> | void;
  onUpdate: (updates: Partial<Item>) => void;
}

export function ItemDetailSidebar({
  item,
  initialTab = 'details',
  onClose,
  onRefresh,
  onUpdate,
}: ItemDetailSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [notesMode, setNotesMode] = useState<'edit' | 'preview'>('edit');
  const [newTag, setNewTag] = useState('');
  const [showMetaSkillPicker, setShowMetaSkillPicker] = useState(false);
  const [metaSkills, setMetaSkills] = useState<MetaSkill[]>([]);

  const normalizeItem = (i: Item): Item => ({
    ...i,
    blockedBy: i.blockedBy ?? [],
    blocking: i.blocking ?? [],
    tags: i.tags ?? [],
    metaSkillIds: i.metaSkillIds ?? [],
    principleIds: i.principleIds ?? [],
  });

  const [editedItem, setEditedItem] = useState<Item>(() => normalizeItem(item));

  useEffect(() => {
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
    const tag = newTag.trim();
    if (tag && !(editedItem.tags ?? []).includes(tag)) {
      setEditedItem({
        ...editedItem,
        tags: [...(editedItem.tags ?? []), tag]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedItem({
      ...editedItem,
      tags: (editedItem.tags ?? []).filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddMetaSkill = (metaSkillId: string) => {
    const current = editedItem.metaSkillIds ?? [];
    if (!current.includes(metaSkillId)) {
      setEditedItem({
        ...editedItem,
        metaSkillIds: [...current, metaSkillId]
      });
      setShowMetaSkillPicker(false);
    }
  };

  const handleRemoveMetaSkill = (metaSkillId: string) => {
    setEditedItem({
      ...editedItem,
      metaSkillIds: (editedItem.metaSkillIds ?? []).filter(id => id !== metaSkillId)
    });
  };

  return (
    <div className="fixed bottom-0 right-0 top-0 z-50 flex w-[clamp(20rem,38vw,26rem)] max-w-[92vw] flex-col border-l border-[#d7c2a3] bg-[linear-gradient(180deg,#fffefb,#fff7ea)] shadow-[0_14px_32px_rgba(96,66,29,0.16)]">
      <ItemSidebarHeader
        isEditing={isEditing}
        onClose={onClose}
        onSave={handleSave}
      />

      <ItemSidebarTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="lb-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'details' ? (
          <ItemDetailsContent
            item={item}
            editedItem={editedItem}
            isEditing={isEditing}
            newTag={newTag}
            showMetaSkillPicker={showMetaSkillPicker}
            metaSkills={metaSkills}
            onEditedItemChange={setEditedItem}
            onNewTagChange={setNewTag}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onAddMetaSkill={handleAddMetaSkill}
            onRemoveMetaSkill={handleRemoveMetaSkill}
            onToggleMetaSkillPicker={() => setShowMetaSkillPicker(!showMetaSkillPicker)}
          />
        ) : activeTab === 'notes' ? (
          <ItemNotesContent
            editedItem={editedItem}
            notesMode={notesMode}
            isEditing={isEditing}
            onEditedItemChange={(item) => {
              setEditedItem(item);
              setIsEditing(true);
            }}
            onNotesModeChange={setNotesMode}
            onSave={handleSave}
          />
        ) : activeTab === 'experience' ? (
          <ItemExperienceContent item={item} />
        ) : (
          <BreakdownSidebarContent
            itemId={item.id}
            title={item.title}
            itemNotes={editedItem.notes || item.notes || ''}
            onNotesUpdate={(notes) =>
              setEditedItem((prev) => ({
                ...prev,
                notes,
              }))
            }
            onConfirm={async () => {
              await onRefresh?.();
            }}
          />
        )}
      </div>

      {activeTab === 'details' && (
        <ItemSidebarFooter
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancel={() => {
            setEditedItem(normalizeItem(item));
            setIsEditing(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
