import { NextResponse } from 'next/server';
import { readStorage, writeStorage } from '@/lib/server/storage';
import { sync } from '@/lib/server/obsidian-sync';
import type { ObsidianSyncConfig } from '@/lib/types';

export async function POST(request: Request) {
  const storage = await readStorage();

  // Get config from storage or request body
  const body = await request.json().catch(() => ({}));
  const config: ObsidianSyncConfig | undefined = body.config || storage.obsidianConfig;

  if (!config || !config.vaultPath) {
    return NextResponse.json(
      { error: 'Obsidian sync not configured. Set vault path first via /api/obsidian/config' },
      { status: 400 },
    );
  }

  if (!config.enabled) {
    return NextResponse.json({ error: 'Obsidian sync is disabled' }, { status: 400 });
  }

  const result = await sync(config, storage.principles);

  // Save imported principles
  if (result.imported.length > 0) {
    storage.principles.push(...result.imported);
  }

  // Update sync timestamp
  storage.obsidianConfig = {
    ...config,
    lastSyncAt: new Date().toISOString(),
  };

  await writeStorage(storage);

  return NextResponse.json({
    imported: result.imported.length,
    exported: result.exported,
    updated: result.updated,
    lastSyncAt: new Date().toISOString(),
  });
}

export async function GET() {
  const storage = await readStorage();
  const config = storage.obsidianConfig;

  return NextResponse.json({
    configured: !!config?.vaultPath,
    enabled: config?.enabled ?? false,
    lastSyncAt: config?.lastSyncAt ?? null,
  });
}
