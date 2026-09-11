'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { RequestItem } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { SourceBadge } from '@/components/SourceBadge';
import { FollowUpBadge } from '@/components/FollowUpBadge';
import { 
  UserCheck, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Briefcase,
  Inbox
} from 'lucide-react';
import { format } from 'date-fns';

export default function MyWorkPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/requests?assigneeId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load employee requests', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchMyRequests();
    }
  }, [currentUser, fetchMyRequests]);

  const activeRequests = requests.filter((r) => r.status !== 'DONE');
  const urgentOrDueFollowUps = requests.filter(
    (r) =>
      r.status !== 'DONE' &&
      (r.isOverdue || r.nextFollowUp?.status === 'MISSED' || r.nextFollowUp?.status === 'DUE')
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ee]">
      <Navbar onRequestCreated={fetchMyRequests} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-earth-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-espresso-950 tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-terracotta-700" />
                <span>My Assigned Work</span>
              </h1>
              {currentUser && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-clay-100 text-clay-900 font-semibold border border-clay-300">
                  {currentUser.name} ({currentUser.role})
                </span>
              )}
            </div>
            <p className="text-xs text-earth-600 mt-1 font-medium">
              Focused operator queue: requests you are currently responsible for delivering or following up on.
            </p>
          </div>
        </div>

        {/* Action Needed Immediately Banner */}
        {urgentOrDueFollowUps.length > 0 && (
          <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Attention Needed: Overdue or Due Today ({urgentOrDueFollowUps.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgentOrDueFollowUps.map((req) => (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  className="bg-white p-3 rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow transition flex items-start justify-between group"
                >
                  <div>
                    <div className="font-semibold text-xs text-espresso-900 group-hover:text-terracotta-700 transition">
                      {req.title}
                    </div>
                    <div className="text-[11px] text-earth-600 mt-0.5">
                      {req.client?.name}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <FollowUpBadge followUp={req.nextFollowUp} />
                    {req.isOverdue && (
                      <span className="text-[10px] text-rose-700 font-bold uppercase mt-1">
                        Overdue deadline
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Active Assigned Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-earth-200 bg-earth-50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-earth-900 uppercase tracking-wider">
              All Assigned Active Work ({activeRequests.length})
            </h2>
          </div>

          <div className="divide-y divide-earth-100">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-earth-400">
                Loading assigned tasks...
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Inbox className="w-8 h-8 text-earth-300 mx-auto" />
                <div className="text-xs font-medium text-earth-700">
                  No active requests assigned to you
                </div>
                <p className="text-[11px] text-earth-400">
                  You can claim unassigned requests from the Operations inbox or check completed items.
                </p>
              </div>
            ) : (
              activeRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 hover:bg-earth-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/requests/${req.id}`}
                        className="font-semibold text-xs text-espresso-900 hover:text-terracotta-700 transition"
                      >
                        {req.title}
                      </Link>
                      <PriorityBadge priority={req.priority} />
                      <SourceBadge source={req.source} />
                    </div>

                    <div className="text-xs text-earth-700">
                      Client: <strong className="text-espresso-900">{req.client?.name}</strong>
                    </div>

                    {req.status === 'WAITING_ON_CLIENT' && req.waitingReason && (
                      <div className="text-[11px] text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-medium">
                        Waiting note: {req.waitingReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <StatusBadge status={req.status} />
                    <FollowUpBadge followUp={req.nextFollowUp} />
                    <Link
                      href={`/requests/${req.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-800 bg-terracotta-50 hover:bg-terracotta-100 px-3 py-1.5 rounded-md transition border border-terracotta-200"
                    >
                      <span>Work on this</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
