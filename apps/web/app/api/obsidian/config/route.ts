import { NextResponse } from 'next/server';
import { readStorage, writeStorage } from '@/lib/server/storage';
import type { ObsidianSyncConfig } from '@/lib/types';

export async function GET() {
  const storage = await readStorage();
  const config = storage.obsidianConfig;

  return NextResponse.json(
    config || { vaultPath: '', syncFolder: 'LifeBetter/Principles', enabled: false },
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { vaultPath, syncFolder, enabled } = body;

  if (!vaultPath) {
    return NextResponse.json({ error: 'vaultPath is required' }, { status: 400 });
  }

  const storage = await readStorage();
  const existing = storage.obsidianConfig;

  const config: ObsidianSyncConfig = {
    vaultPath,
    syncFolder: syncFolder || existing?.syncFolder || 'LifeBetter/Principles',
    enabled: enabled ?? true,
    lastSyncAt: existing?.lastSyncAt,
  };

  storage.obsidianConfig = config;
  await writeStorage(storage);

  return NextResponse.json(config);
}
