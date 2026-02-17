import type { AgentSessionStatus } from '@/lib/types';

interface AgentStatusBadgeProps {
  status: AgentSessionStatus;
}

const statusConfig: Record<AgentSessionStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  running: { label: 'Running', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse' },
  completed: { label: 'Done', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
};

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
