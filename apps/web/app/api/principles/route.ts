import { NextResponse } from 'next/server';
import { readStorage, writeStorage } from '@/lib/server/storage';
import type { Principle } from '@/lib/types';

function generateId() {
  return `principle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  const storage = await readStorage();
  return NextResponse.json(storage.principles);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description, howToApply, triggers, source } = body;

  if (!name || !howToApply) {
    return NextResponse.json({ error: 'name and howToApply are required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const principle: Principle = {
    id: generateId(),
    name,
    description: description || '',
    version: 1,
    confidence: 0.5,
    triggers: triggers || { taskTypes: [], complexityRange: [], domains: [], keywords: [] },
    howToApply,
    relations: { complementary: [], prerequisite: [], conflicting: [] },
    derivedFrom: { experienceIds: [], discoveredAt: now, lastRefinedAt: now },
    applications: [],
    source: source || 'discovered',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const storage = await readStorage();
  storage.principles.push(principle);
  await writeStorage(storage);

  return NextResponse.json(principle, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const storage = await readStorage();
  const index = storage.principles.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Principle not found' }, { status: 404 });
  }

  const existing = storage.principles[index];

  // If howToApply changed, bump version
  const versionBump = updates.howToApply && updates.howToApply !== existing.howToApply ? 1 : 0;

  storage.principles[index] = {
    ...existing,
    ...updates,
    id: existing.id,
    version: existing.version + versionBump,
    updatedAt: new Date().toISOString(),
  };
  await writeStorage(storage);

  return NextResponse.json(storage.principles[index]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const storage = await readStorage();
  storage.principles = storage.principles.filter((p) => p.id !== id);
  await writeStorage(storage);

  return NextResponse.json({ success: true });
}
