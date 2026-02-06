import { Clock, Plus, Edit, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  itemId: string;
  title: string;
  type: 'created' | 'updated' | 'completed' | 'status_change';
  status?: string;
  priority?: string;
  timestamp: string;
  description?: string;
}

interface TimelineEventProps {
  item: TimelineItem;
}

export function TimelineEvent({ item }: TimelineEventProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="w-3.5 h-3.5 text-[#b36d2e]" />;
      case 'updated':
        return <Edit className="w-3.5 h-3.5 text-[#615646]" />;
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#2f7b65]" />;
      case 'status_change':
        return <AlertCircle className="w-3.5 h-3.5 text-[#2f6283]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#8d7f6a]" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-[#faefde] border-[#ebd3aa]';
      case 'updated':
        return 'bg-[#f8f2e8] border-[#dfcfb4]';
      case 'completed':
        return 'bg-[#e8f4ec] border-[#b8ddcb]';
      case 'status_change':
        return 'bg-[#e8f1f8] border-[#c2d8ea]';
      default:
        return 'bg-[#f8f2e8] border-[#dfcfb4]';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done':
        return 'bg-emerald-100 text-emerald-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      case 'blocked':
        return 'bg-rose-100 text-rose-800';
      case 'todo':
        return 'bg-sky-100 text-sky-800';
      case 'backlog':
        return 'bg-stone-100 text-stone-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-white/90 p-3 transition-all hover:shadow-[0_8px_18px_rgba(95,67,31,0.12)]',
        getEventColor(item.type)
      )}
    >
      <div className="absolute -left-[17px] top-4 h-3.5 w-3.5 rounded-full border-2 border-[#cf7a41] bg-white" />

      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#decfb8] bg-white">
          {getEventIcon(item.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#756754]">
              {item.type.replace('_', ' ')}
            </span>
            {item.status && (
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                getStatusColor(item.status)
              )}>
                {item.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <h3 className="mb-1 text-sm font-semibold text-[#2f271c]">
            {item.title}
          </h3>

          {item.description && (
            <p className="mb-1.5 text-xs text-[#6f6352]">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-[#7e725f]">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(item.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
