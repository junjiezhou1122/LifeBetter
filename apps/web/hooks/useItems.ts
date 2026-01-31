import { useState, useEffect } from 'react';
import type { Item, ItemStatus } from '@/types';

export function useItems(currentParentId: string | null) {
  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [currentParentId]);

  useEffect(() => {
    fetchAllItems();
  }, [items]);

  const fetchItems = async () => {
    try {
      const parentParam = currentParentId === null ? 'null' : currentParentId;
      const res = await fetch(`/api/items?parentId=${parentParam}`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setAllItems(data);
    } catch (error) {
      console.error('Failed to fetch all items:', error);
    }
  };

  const getChildCount = (itemId: string) => {
    return allItems.filter((item) => item.parentId === itemId).length;
  };

  const addItem = async (title: string, description: string, priority: string, status?: ItemStatus) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: currentParentId,
          title,
          description,
          priority,
          status,
        }),
      });
      const newItem = await res.json();
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (error) {
      console.error('Failed to create item:', error);
      throw error;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await fetch(`/api/items?id=${itemId}`, {
        method: 'DELETE',
      });
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  };

  const updateItem = async (itemId: string, updates: Partial<Item>) => {
    try {
      await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, updates }),
      });

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? ({ ...item, ...updates, updatedAt: new Date().toISOString() } as Item)
            : item,
        ),
      );

      return true;
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  };

  const refreshItems = async () => {
    setLoading(true);
    await fetchItems();
  };

  return {
    items,
    allItems,
    loading,
    getChildCount,
    addItem,
    deleteItem,
    updateItem,
    refreshItems,
  };
}
