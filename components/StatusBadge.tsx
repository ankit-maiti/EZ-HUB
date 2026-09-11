import React from 'react';
import { RequestStatus } from '@/lib/types';
import { 
  Sparkles, 
  HelpCircle, 
  UserCheck, 
  PlayCircle, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

interface Props {
  status: RequestStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: Props) {
  switch (status) {
    case 'NEW':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-earth-100 text-earth-800 border border-earth-300 ${className}`}>
          <Sparkles className="w-3.5 h-3.5 text-earth-600" />
          <span>New Request</span>
        </span>
      );
    case 'NEEDS_CLARIFICATION':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100/80 text-amber-900 border border-amber-300 ${className}`}>
          <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
          <span>Needs Clarification</span>
        </span>
      );
    case 'READY_TO_ASSIGN':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-clay-100 text-clay-900 border border-clay-300 ${className}`}>
          <UserCheck className="w-3.5 h-3.5 text-clay-700" />
          <span>Ready to Assign</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-terracotta-100 text-terracotta-900 border border-terracotta-300 ${className}`}>
          <PlayCircle className="w-3.5 h-3.5 text-terracotta-700 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    case 'WAITING_ON_CLIENT':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-950 border border-amber-400 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Waiting on Client</span>
        </span>
      );
    case 'DONE':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#edf4e8] text-[#2d4f1e] border border-[#c1d9b7] ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#3f6212]" />
          <span>Done</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-earth-100 text-earth-700 ${className}`}>
          {status}
        </span>
      );
  }
}
