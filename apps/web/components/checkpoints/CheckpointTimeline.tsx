'use client';

import { useState, useEffect } from 'react';
import { Clock, GitBranch, CheckCircle, XCircle, AlertTriangle, Play, Loader2 } from 'lucide-react';
import type { Checkpoint } from '@/lib/types';

interface CheckpointTimelineProps {
  sessionId: string;
}

function TypeIcon({ type }: { type: Checkpoint['type'] }) {
  switch (type) {
    case 'start':
      return <Play className="h-3.5 w-3.5 text-blue-500" />;
    case 'validation':
      return <CheckCircle className="h-3.5 w-3.5 text-amber-500" />;
    case 'merge':
      return <GitBranch className="h-3.5 w-3.5 text-purple-500" />;
    case 'complete':
      return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-[#6c5d47]" />;
  }
}

export function CheckpointTimeline({ sessionId }: CheckpointTimelineProps) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    setLoading(true);
    fetch(`/api/checkpoints?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCheckpoints(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#6c5d47]" />
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-[#8e7e67]">
        No checkpoints recorded yet
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
        Session Timeline
      </p>

      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#dbc9ad]" />

        {checkpoints.map((cp, i) => (
          <div key={cp.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Node */}
            <div className="relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white border border-[#dbc9ad]">
              <TypeIcon type={cp.type} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#2f271c]">{cp.title}</p>
              <p className="text-[10px] text-[#7a6b57]">{cp.description}</p>

              {cp.gitCommit && (
                <p className="mt-0.5 text-[10px] font-mono text-[#8e7e67]">
                  {cp.gitCommit.slice(0, 8)}
                </p>
              )}

              {cp.changes && cp.changes.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {cp.changes.slice(0, 5).map((change, j) => (
                    <p key={j} className="text-[10px] text-[#7a6b57]">
                      {change.file}{' '}
                      <span className="text-green-600">+{change.additions}</span>{' '}
                      <span className="text-red-500">-{change.deletions}</span>
                    </p>
                  ))}
                  {cp.changes.length > 5 && (
                    <p className="text-[10px] text-[#8e7e67]">
                      ...and {cp.changes.length - 5} more files
                    </p>
                  )}
                </div>
              )}

              {cp.validationResult && (
                <div className="mt-1 flex gap-2">
                  {cp.validationResult.checks.map((check, j) => (
                    <span
                      key={j}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        check.status === 'pass'
                          ? 'bg-green-50 text-green-700'
                          : check.status === 'fail'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {check.status === 'pass' ? (
                        <CheckCircle className="h-2.5 w-2.5" />
                      ) : check.status === 'fail' ? (
                        <XCircle className="h-2.5 w-2.5" />
                      ) : (
                        <AlertTriangle className="h-2.5 w-2.5" />
                      )}
                      {check.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-0.5 text-[9px] text-[#a09383]">
                {new Date(cp.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
