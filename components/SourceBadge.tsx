import React from 'react';
import { RequestSource } from '@/lib/types';
import { MessageSquare, Mail, Layers } from 'lucide-react';

interface Props {
  source: RequestSource | string;
  className?: string;
}

export function SourceBadge({ source, className = '' }: Props) {
  switch (source) {
    case 'WHATSAPP':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#edf4e8] text-[#2d4f1e] border border-[#c1d9b7] ${className}`}>
          <MessageSquare className="w-3 h-3 text-[#3f6212]" />
          <span>WhatsApp</span>
        </span>
      );
    case 'EMAIL':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-clay-100 text-clay-900 border border-clay-300 ${className}`}>
          <Mail className="w-3 h-3 text-clay-700" />
          <span>Email</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-earth-100 text-earth-800 border border-earth-300 ${className}`}>
          <Layers className="w-3 h-3 text-earth-600" />
          <span>Manual</span>
        </span>
      );
  }
}
