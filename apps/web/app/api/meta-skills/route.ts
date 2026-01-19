import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MetaSkill, ItemStorage } from '@lifebetter/shared/types';

const STORAGE_PATH = path.join(process.env.HOME || '', '.lifebetter', 'problems.json');

async function readStorage(): Promise<ItemStorage> {
  try {
    const data = await fs.readFile(STORAGE_PATH, 'utf-8');
    const storage = JSON.parse(data);

    // Ensure metaSkills array exists
    if (!storage.metaSkills) {
      storage.metaSkills = [];
    }

    return storage;
  } catch (error) {
    return { items: [], metaSkills: [], notifications: [], version: 2 };
  }
}

async function writeStorage(storage: ItemStorage): Promise<void> {
  const dir = path.dirname(STORAGE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(STORAGE_PATH, JSON.stringify(storage, null, 2), 'utf-8');
}

// GET - List all meta-skills or get by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const storage = await readStorage();

    if (id) {
      const metaSkill = storage.metaSkills.find(ms => ms.id === id);
      if (!metaSkill) {
        return NextResponse.json({ error: 'Meta-skill not found' }, { status: 404 });
      }
      return NextResponse.json(metaSkill);
    }

    let metaSkills = storage.metaSkills;

    // Sort by effectiveness (most effective first)
    metaSkills.sort((a, b) => {
      const effA = a.timesApplied > 0 ? a.timesSuccessful / a.timesApplied : 0;
      const effB = b.timesApplied > 0 ? b.timesSuccessful / b.timesApplied : 0;
      return effB - effA;
    });

    return NextResponse.json(metaSkills);
  } catch (error) {
    console.error('Error reading meta-skills:', error);
    return NextResponse.json({ error: 'Failed to read meta-skills' }, { status: 500 });
  }
}

// POST - Create new meta-skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, examples, personalNotes, workflow } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const storage = await readStorage();

    // Check for duplicate name
    if (storage.metaSkills.some(ms => ms.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json(
        { error: 'Meta-skill with this name already exists' },
        { status: 400 }
      );
    }

    const newMetaSkill: MetaSkill = {
      id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      examples: examples || [],
      workflow: workflow || {
        type: 'ai-breakdown',
        aiPrompt: `Break down this problem using the "${name}" approach: ${description}`
      },
      timesApplied: 0,
      timesSuccessful: 0,
      effectiveness: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'discovered',
      isActive: true,
      personalNotes,
      reviewIntervalDays: 1
    };

    storage.metaSkills.push(newMetaSkill);
    await writeStorage(storage);

    return NextResponse.json(newMetaSkill, { status: 201 });
  } catch (error) {
    console.error('Error creating meta-skill:', error);
    return NextResponse.json({ error: 'Failed to create meta-skill' }, { status: 500 });
  }
}

// PATCH - Update meta-skill
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const storage = await readStorage();
    const index = storage.metaSkills.findIndex(ms => ms.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Meta-skill not found' }, { status: 404 });
    }

    // Handle timesSuccessful increment
    if (updates.timesSuccessful !== undefined) {
      if (updates.timesSuccessful === 1) {
        // Increment success counter
        storage.metaSkills[index].timesSuccessful += 1;
        delete updates.timesSuccessful;
      }
    }

    // Update meta-skill
    storage.metaSkills[index] = {
      ...storage.metaSkills[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recalculate effectiveness if times changed
    if (updates.timesApplied !== undefined || updates.timesSuccessful !== undefined) {
      const ms = storage.metaSkills[index];
      ms.effectiveness = ms.timesApplied > 0 ? ms.timesSuccessful / ms.timesApplied : 0;
    }

    await writeStorage(storage);

    return NextResponse.json(storage.metaSkills[index]);
  } catch (error) {
    console.error('Error updating meta-skill:', error);
    return NextResponse.json({ error: 'Failed to update meta-skill' }, { status: 500 });
  }
}

// DELETE - Delete meta-skill
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const storage = await readStorage();
    const index = storage.metaSkills.findIndex(ms => ms.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Meta-skill not found' }, { status: 404 });
    }

    // Remove meta-skill
    storage.metaSkills.splice(index, 1);

    // Remove from all items
    storage.items.forEach(item => {
      if (item.metaSkillIds) {
        item.metaSkillIds = item.metaSkillIds.filter(msId => msId !== id);
      }
    });

    await writeStorage(storage);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meta-skill:', error);
    return NextResponse.json({ error: 'Failed to delete meta-skill' }, { status: 500 });
  }
}
