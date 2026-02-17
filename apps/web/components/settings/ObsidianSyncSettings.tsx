'use client';

import { useState, useEffect } from 'react';
import { FolderSync, RefreshCw, Loader2, Check, Settings } from 'lucide-react';
import type { ObsidianSyncConfig } from '@/lib/types';

export function ObsidianSyncSettings() {
  const [config, setConfig] = useState<ObsidianSyncConfig>({
    vaultPath: '',
    syncFolder: 'LifeBetter/Principles',
    enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; exported: number; updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/obsidian/config')
      .then((res) => res.json())
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/obsidian/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
    setSaving(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);
    try {
      const res = await fetch('/api/obsidian/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(data);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-[#6c5d47]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-4 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-3 flex items-center gap-2">
          <FolderSync className="h-4 w-4 text-[#d26a3b]" />
          <p className="text-sm font-semibold text-[#2f271c]">Obsidian Vault Sync</p>
        </div>

        <div className="space-y-3">
          {/* Vault path */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6c5d47]">
              Vault Path
            </label>
            <input
              type="text"
              value={config.vaultPath}
              onChange={(e) => setConfig({ ...config, vaultPath: e.target.value })}
              placeholder="/Users/you/ObsidianVault"
              className="w-full rounded-lg border border-[#dbc9ad] bg-[#faf6ef] px-3 py-2 text-xs text-[#2f271c] placeholder-[#a09383] focus:border-[#d26a3b] focus:outline-none"
            />
          </div>

          {/* Sync folder */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#6c5d47]">
              Sync Folder (relative to vault)
            </label>
            <input
              type="text"
              value={config.syncFolder}
              onChange={(e) => setConfig({ ...config, syncFolder: e.target.value })}
              placeholder="LifeBetter/Principles"
              className="w-full rounded-lg border border-[#dbc9ad] bg-[#faf6ef] px-3 py-2 text-xs text-[#2f271c] placeholder-[#a09383] focus:border-[#d26a3b] focus:outline-none"
            />
          </div>

          {/* Enabled toggle */}
          <label className="flex items-center gap-2 text-xs text-[#6c5d47]">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="rounded border-[#dbc9ad]"
            />
            <span className="font-medium">Enable sync</span>
          </label>

          {/* Last sync */}
          {config.lastSyncAt && (
            <p className="text-[10px] text-[#8e7e67]">
              Last synced: {new Date(config.lastSyncAt).toLocaleString()}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !config.vaultPath}
              className="flex items-center gap-1.5 rounded-lg bg-[#2f7b65] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1f5b47] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Settings className="h-3 w-3" />}
              Save Config
            </button>

            <button
              onClick={handleSync}
              disabled={syncing || !config.vaultPath || !config.enabled}
              className="flex items-center gap-1.5 rounded-lg bg-[#d26a3b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:opacity-50"
            >
              {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Sync Now
            </button>
          </div>

          {/* Sync result */}
          {syncResult && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2 text-xs text-green-700">
              <Check className="h-3.5 w-3.5" />
              Imported: {syncResult.imported} | Exported: {syncResult.exported} | Updated: {syncResult.updated}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
