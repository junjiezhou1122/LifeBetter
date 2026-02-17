'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play, GitMerge, Loader2 } from 'lucide-react';
import type { ValidationResult, ValidationCheck } from '@/lib/types';

interface ValidationReportProps {
  sessionId: string;
  onMerged?: () => void;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pass':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default:
      return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  }
}

export function ValidationReport({ sessionId, onMerged }: ValidationReportProps) {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<{ success: boolean; output: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    setValidating(true);
    setError(null);
    try {
      const res = await fetch(`/api/agent/sessions/${sessionId}/validate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate');
    }
    setValidating(false);
  };

  const handleMerge = async () => {
    setMerging(true);
    setError(null);
    try {
      const res = await fetch(`/api/agent/sessions/${sessionId}/merge`, {
        method: 'POST',
      });
      const data = await res.json();
      setMergeResult(data);
      if (data.success) {
        onMerged?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge');
    }
    setMerging(false);
  };

  return (
    <div className="rounded-xl border border-[#dbc9ad] bg-white/85 p-3 shadow-[0_6px_18px_rgba(95,67,31,0.1)]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6c5d47]">
        QA Validation
      </p>

      {/* Validate button */}
      {!result && (
        <button
          onClick={handleValidate}
          disabled={validating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f7ead5] px-4 py-2 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f2e1c7] disabled:opacity-50"
        >
          {validating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {validating ? 'Validating...' : 'Run Validation'}
        </button>
      )}

      {/* Validation results */}
      {result && (
        <div className="space-y-2">
          {result.checks.map((check: ValidationCheck, i: number) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-[#e8dcc9] bg-[#faf6ef] p-2.5"
            >
              <StatusIcon status={check.status} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#2f271c]">{check.name}</p>
                {check.duration && (
                  <p className="text-[10px] text-[#7a6b57]">{(check.duration / 1000).toFixed(1)}s</p>
                )}
                {check.output && check.status !== 'pass' && (
                  <pre className="mt-1 max-h-24 overflow-auto rounded bg-[#1e1e1e] p-2 text-[10px] text-gray-300">
                    {check.output.slice(0, 1000)}
                  </pre>
                )}
              </div>
            </div>
          ))}

          {/* Overall status */}
          <div
            className={`flex items-center gap-2 rounded-lg p-2 text-xs font-semibold ${
              result.overallStatus === 'pass'
                ? 'bg-green-50 text-green-700'
                : result.overallStatus === 'warning'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
            }`}
          >
            <StatusIcon status={result.overallStatus} />
            {result.overallStatus === 'pass'
              ? 'All checks passed'
              : result.overallStatus === 'warning'
                ? 'Passed with warnings'
                : 'Validation failed'}
          </div>

          {/* Re-validate button */}
          <button
            onClick={handleValidate}
            disabled={validating}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#dbc9ad] px-3 py-1.5 text-xs font-semibold text-[#6c5d47] transition hover:bg-[#f7ead5] disabled:opacity-50"
          >
            {validating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Re-validate
          </button>

          {/* Merge button - only if passed */}
          {result.overallStatus !== 'fail' && !mergeResult && (
            <button
              onClick={handleMerge}
              disabled={merging}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2f7b65] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1f5b47] disabled:opacity-50"
            >
              {merging ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GitMerge className="h-3.5 w-3.5" />
              )}
              {merging ? 'Merging...' : 'Merge to Main'}
            </button>
          )}

          {/* Merge result */}
          {mergeResult && (
            <div
              className={`rounded-lg p-2 text-xs font-semibold ${
                mergeResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {mergeResult.success ? 'Merged successfully!' : `Merge failed: ${mergeResult.output}`}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
