'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Square, Trash2, Plus, Loader2, RefreshCw } from 'lucide-react';
import { AgentStatusBadge } from './AgentStatusBadge';
import type { QueueItem } from '@/lib/types';

interface AgentQueuePanelProps {
  parentId?: string;
}

export function AgentQueuePanel({ parentId }: AgentQueuePanelProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pool, setPool] = useState<{ maxConcurrent: number; activeAgents: number; defaultAgent: string } | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const [qRes, pRes] = await Promise.all([
        fetch('/api/agent/queue'),
        fetch('/api/agent/pool'),
      ]);
      setQueue(await qRes.json());
      setPool(await pRes.json());
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleEnqueueChildren = async () => {
    if (!parentId) return;
    setLoading(true);
    try {
      await fetch('/api/agent/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enqueue-children', parentId }),
      });
      await fetchQueue();
    } catch (err) {
      console.error('Failed to enqueue:', err);
    }
    setLoading(false);
  };

  const handleCancelAll = async () => {
    await fetch('/api/agent/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel-all' }),
    });
    await fetchQueue();
  };

  const handleClearCompleted = async () => {
    await fetch('/api/agent/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear-completed' }),
    });
    await fetchQueue();
  };

  const handleRemove = async (taskId: string) => {
    await fetch(`/api/agent/queue?taskId=${taskId}`, { method: 'DELETE' });
    await fetchQueue();
  };

  const handlePoolChange = async (maxConcurrent: number) => {
    await fetch('/api/agent/pool', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxConcurrent }),
    });
    await fetchQueue();
  };

  const statusOrder: Record<string, number> = { running: 0, queued: 1, blocked: 2, completed: 3, failed: 4 };
  const sortedQueue = [...queue].sort((a, b) =>
    (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5) || b.priority - a.priority,
  );

  const running = queue.filter((q) => q.status === 'running').length;
  const queued = queue.filter((q) => q.status === 'queued').length;
  const completed = queue.filter((q) => q.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Pool status */}
      <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Agent Pool
          </p>
          <button onClick={fetchQueue} className="text-[#6c5d47] hover:text-[#2f271c]">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mb-3 flex gap-3 text-xs text-[#5d4b34]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            {running} running
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            {queued} queued
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
            {completed} done
          </span>
        </div>

        {/* Concurrency slider */}
        {pool && (
          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-semibold text-[#6c5d47]">
              Max Parallel Agents: {pool.maxConcurrent}
            </label>
            <input
              type="range"
              min={1}
              max={12}
              value={pool.maxConcurrent}
              onChange={(e) => handlePoolChange(Number(e.target.value))}
              className="w-full accent-[#d26a3b]"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {parentId && (
            <button
              onClick={handleEnqueueChildren}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-[#d26a3b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#bb5a2f] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Queue Sub-tasks
            </button>
          )}
          {queue.length > 0 && (
            <>
              <button
                onClick={handleCancelAll}
                className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Square className="h-3 w-3" />
                Cancel All
              </button>
              <button
                onClick={handleClearCompleted}
                className="flex items-center gap-1.5 rounded-lg border border-[#dbc9ad] px-3 py-1.5 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f7ead5]"
              >
                <Trash2 className="h-3 w-3" />
                Clear Done
              </button>
            </>
          )}
        </div>
      </div>

      {/* Queue list */}
      {sortedQueue.length > 0 && (
        <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
            Task Queue
          </p>
          <div className="space-y-1.5">
            {sortedQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-[#e8dcc9] bg-[#faf6ef] p-2"
              >
                <QueueStatusDot status={item.status} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-[#2f271c]">
                    {item.taskId.slice(0, 12)}...
                  </p>
                  <p className="text-[10px] text-[#7a6b57]">
                    Priority: {item.priority} {item.dependencies.length > 0 && `| Deps: ${item.dependencies.length}`}
                  </p>
                </div>
                <AgentStatusBadge status={item.status === 'queued' ? 'pending' : item.status === 'blocked' ? 'pending' : item.status} />
                {(item.status === 'queued' || item.status === 'blocked') && (
                  <button
                    onClick={() => handleRemove(item.taskId)}
                    className="text-[#8e7e67] hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QueueStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running: 'bg-green-500',
    queued: 'bg-amber-400',
    blocked: 'bg-orange-400',
    completed: 'bg-gray-400',
    failed: 'bg-red-500',
  };
  return (
    <span className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${colors[status] || 'bg-gray-300'}`} />
  );
}
