import React from 'react';
import { RequestPriority } from '@/lib/types';
import { AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  priority: RequestPriority | string;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: Props) {
  switch (priority) {
    case 'URGENT':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-950 border border-rose-300 ${className}`}>
          <AlertCircle className="w-3 h-3 text-rose-700 animate-bounce" />
          <span>URGENT</span>
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-terracotta-100 text-terracotta-900 border border-terracotta-300 ${className}`}>
          <ArrowUp className="w-3 h-3 text-terracotta-700" />
          <span>High</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-earth-100 text-earth-800 border border-earth-300 ${className}`}>
          <span>Medium</span>
        </span>
      );
    case 'LOW':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-earth-50 text-earth-600 border border-earth-200 ${className}`}>
          <ArrowDown className="w-3 h-3 text-earth-400" />
          <span>Low</span>
        </span>
      );
    default:
      return <span>{priority}</span>;
  }
}
