import { Calendar, Clock, Plus, Edit, CheckCircle2, AlertCircle } from 'lucide-react';
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
        return <Plus className="w-4 h-4 text-amber-500" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-stone-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'status_change':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-stone-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-amber-100 border-amber-200';
      case 'updated':
        return 'bg-stone-100 border-stone-200';
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'status_change':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-stone-100 border-stone-200';
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
        'relative bg-white rounded-lg border p-4 hover:shadow-md transition-all',
        getEventColor(item.type)
      )}
    >
      <div className="absolute -left-[29px] top-5 w-4 h-4 rounded-full bg-white border-2 border-amber-500" />

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center">
          {getEventIcon(item.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-stone-500 uppercase">
              {item.type.replace('_', ' ')}
            </span>
            {item.status && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                getStatusColor(item.status)
              )}>
                {item.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <h3 className="text-sm font-medium text-stone-900 mb-1">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-stone-600 mb-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Clock className="w-3 h-3" />
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
