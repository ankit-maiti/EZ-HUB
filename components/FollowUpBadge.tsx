import React from 'react';
import { FollowUpItem } from '@/lib/types';
import { Clock, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

interface Props {
  followUp: FollowUpItem | null | undefined;
  className?: string;
  showNote?: boolean;
}

export function FollowUpBadge({ followUp, className = '', showNote = false }: Props) {
  if (!followUp) {
    return <span className="text-xs text-earth-400 italic">None scheduled</span>;
  }

  const date = new Date(followUp.scheduledAt);
  let dateText = format(date, 'MMM d');
  if (isToday(date)) dateText = 'Today';
  else if (isTomorrow(date)) dateText = 'Tomorrow';
  else if (isYesterday(date)) dateText = 'Yesterday';

  if (followUp.status === 'MISSED') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100/90 text-rose-950 border border-rose-300 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-rose-700 flex-shrink-0" />
        <span>Missed ({dateText})</span>
      </div>
    );
  }

  if (followUp.status === 'DUE') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-950 border border-amber-400 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 animate-pulse" />
        <span>Due Today</span>
      </div>
    );
  }

  if (followUp.status === 'COMPLETED') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#edf4e8] text-[#2d4f1e] border border-[#c1d9b7] ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#3f6212] flex-shrink-0" />
        <span>Completed</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-earth-100 text-earth-800 border border-earth-300 ${className}`}>
      <Calendar className="w-3.5 h-3.5 text-earth-500 flex-shrink-0" />
      <span>{dateText}</span>
    </div>
  );
}
