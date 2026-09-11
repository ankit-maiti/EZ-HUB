'use client';

import React from 'react';
import { TriageCounts } from '@/lib/types';
import { 
  Briefcase, 
  Clock, 
  UserX, 
  AlertCircle,
  FilterX
} from 'lucide-react';

interface Props {
  counts: TriageCounts;
  selectedTriage: string;
  onSelectTriage: (triage: string) => void;
}

export function TriageCards({ counts, selectedTriage, onSelectTriage }: Props) {
  const cards = [
    {
      id: 'waiting_for_us',
      title: 'Waiting for Us',
      count: counts.waitingForUs,
      description: 'Internal action required',
      icon: Briefcase,
      colorClasses: 'text-clay-900 bg-clay-50/90 border-clay-300 hover:border-clay-500',
      activeClasses: 'ring-2 ring-clay-700 bg-clay-100/90 border-clay-700 shadow-sm',
      badgeClasses: 'bg-clay-700 text-white',
    },
    {
      id: 'waiting_for_client',
      title: 'Waiting on Client',
      count: counts.waitingForClient,
      description: 'Blocked externally (paused)',
      icon: Clock,
      colorClasses: 'text-amber-950 bg-amber-50/90 border-amber-300 hover:border-amber-500',
      activeClasses: 'ring-2 ring-amber-700 bg-amber-100/90 border-amber-700 shadow-sm',
      badgeClasses: 'bg-amber-700 text-white',
    },
    {
      id: 'unassigned',
      title: 'Unassigned',
      count: counts.unassigned,
      description: 'Needs owner assignment',
      icon: UserX,
      colorClasses: 'text-earth-900 bg-earth-100/80 border-earth-300 hover:border-earth-500',
      activeClasses: 'ring-2 ring-earth-800 bg-earth-200/90 border-earth-800 shadow-sm',
      badgeClasses: 'bg-earth-800 text-white',
    },
    {
      id: 'overdue',
      title: 'Overdue Work',
      count: counts.overdue,
      description: 'Past due internal deadlines',
      icon: AlertCircle,
      colorClasses: 'text-terracotta-950 bg-terracotta-50/90 border-terracotta-300 hover:border-terracotta-500',
      activeClasses: 'ring-2 ring-terracotta-700 bg-terracotta-100/90 border-terracotta-700 shadow-sm',
      badgeClasses: 'bg-terracotta-700 text-white',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-earth-700">
            Manager Triage Buckets
          </h2>
          <span className="text-[11px] text-earth-500 font-medium">
            (Click any bucket to filter requests)
          </span>
        </div>
        {selectedTriage && (
          <button
            type="button"
            onClick={() => onSelectTriage('')}
            className="inline-flex items-center gap-1.5 text-xs text-earth-600 hover:text-earth-900 font-semibold transition"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Clear Triage Filter</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => {
          const isSelected = selectedTriage === c.id;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectTriage(isSelected ? '' : c.id)}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between min-h-[96px] shadow-sm ${
                c.colorClasses
              } ${isSelected ? c.activeClasses : ''}`}
            >
              <div className="flex items-start justify-between w-full">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{c.title}</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-sm ${c.badgeClasses}`}>
                  {c.count}
                </span>
              </div>
              <div className="mt-2 text-[11px] opacity-80 font-medium leading-tight">
                {c.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
