'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { RequestItem, RequestStatus, FollowUpItem } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { SourceBadge } from '@/components/SourceBadge';
import { FollowUpBadge } from '@/components/FollowUpBadge';
import {
  WaitingReasonModal,
  ClarificationModal,
  ClientResponseModal,
  FollowUpModal,
} from '@/components/WorkflowModals';
import {
  ArrowLeft,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Building2,
  AlertCircle,
  CheckCircle2,
  Send,
  MessageSquare,
  HelpCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  History,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { currentUser, users, isManager } = useAuth();

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [isClientResponseModalOpen, setIsClientResponseModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // New Note
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/requests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      } else {
        setActionError('Request not found');
      }
    } catch (err) {
      console.error('Failed to load request detail', err);
      setActionError('Failed to load request');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusTransition = async (
    targetStatus: RequestStatus,
    reason?: string,
    clientResponseNote?: string
  ) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          actorId: currentUser?.id,
          reason,
          clientResponseNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setActionSuccess(`Status successfully changed to ${targetStatus.replace(/_/g, ' ')}`);
      await fetchDetail();
    } catch (err: any) {
      setActionError(err.message || 'Status transition error');
    }
  };

  const handleAssign = async (newAssigneeId: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(`/api/requests/${id}/assignee`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeId: newAssigneeId || null,
          actorId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update assignee');
      }

      setActionSuccess('Assignee updated');
      await fetchDetail();
    } catch (err: any) {
      setActionError(err.message || 'Assignment failed');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/requests/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newNote.trim(),
          actorId: currentUser?.id,
          type: 'NOTE_ADDED',
        }),
      });

      if (res.ok) {
        setNewNote('');
        await fetchDetail();
      }
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleCreateFollowUp = async (data: {
    ownerId: string;
    scheduledAt: string;
    note: string;
  }) => {
    const res = await fetch(`/api/requests/${id}/followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        actorId: currentUser?.id,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to schedule follow-up');
    }
    await fetchDetail();
  };

  const handleToggleFollowUp = async (followUpId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/followups/${followUpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !currentCompleted,
          actorId: currentUser?.id,
        }),
      });
      if (res.ok) {
        await fetchDetail();
      }
    } catch (err) {
      console.error('Failed to update follow-up', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f4ee]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 text-terracotta-600 animate-spin" />
            <span className="text-xs text-earth-600 font-medium">Loading request context...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7f4ee]">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-espresso-950">Request Not Found</h2>
          <p className="text-xs text-earth-600 mt-1">
            The requested operations ticket could not be located.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-terracotta-700 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Operations Inbox</span>
          </Link>
        </div>
      </div>
    );
  }

  const lifecycleSteps = [
    { key: 'NEW', label: 'New Request' },
    { key: 'NEEDS_CLARIFICATION', label: 'Clarify' },
    { key: 'READY_TO_ASSIGN', label: 'Ready to Assign' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'DONE', label: 'Done' },
  ];

  const currentStepIndex = lifecycleSteps.findIndex((s) => s.key === request.status);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ee]">
      <Navbar onRequestCreated={fetchDetail} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-earth-700 hover:text-espresso-950 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Operations Inbox</span>
          </Link>
          <div className="text-[11px] text-earth-500 font-mono">
            REF: {request.id}
          </div>
        </div>

        {/* Feedback Alerts */}
        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="p-3 bg-[#edf4e8] border border-[#c1d9b7] rounded-lg text-[#2d4f1e] text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#3f6212] flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Main Request Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
                <SourceBadge source={request.source} />
                {request.isOverdue && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-950 border border-rose-300 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                    <span>OVERDUE INTERNAL WORK</span>
                  </span>
                )}
                {request.status === 'WAITING_ON_CLIENT' && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-950 border border-amber-400">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>OVERDUE TIMER PAUSED (WAITING ON CLIENT)</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-espresso-950 leading-snug">
                {request.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-earth-700 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-earth-400" />
                  <span>Client:</span>
                  <strong className="text-espresso-900">{request.client.name}</strong>
                  {request.client.phone && (
                    <span className="text-earth-500">({request.client.phone})</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-earth-400" />
                  <span>Due:</span>
                  <span className={request.isOverdue ? 'text-rose-800 font-bold' : 'text-earth-900 font-medium'}>
                    {request.dueAt ? format(new Date(request.dueAt), 'MMM d, yyyy') : 'None set'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-earth-400" />
                  <span>Captured:</span>
                  <span>{format(new Date(request.createdAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>

            {/* Quick Assignee Info */}
            <div className="bg-earth-50 border border-earth-200 rounded-lg p-3 min-w-[200px]">
              <div className="text-[11px] font-bold text-earth-600 uppercase tracking-wider mb-1">
                Operational Owner
              </div>
              {request.assignee ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-clay-200 text-clay-900 flex items-center justify-center font-bold text-xs">
                    {request.assignee.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-espresso-950">{request.assignee.name}</div>
                    <div className="text-[10px] text-earth-500">{request.assignee.role}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-semibold">
                  <UserX className="w-4 h-4 text-amber-700" />
                  <span>Unassigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Lifecycle Stepper */}
          <div className="pt-4 border-t border-earth-100">
            <div className="text-[11px] font-bold text-earth-600 uppercase tracking-wider mb-2">
              Request Lifecycle Stage
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {lifecycleSteps.map((step, idx) => {
                const isCurrent = request.status === step.key;
                const isPast = currentStepIndex > idx && request.status !== 'WAITING_ON_CLIENT';
                return (
                  <div
                    key={step.key}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold text-center transition ${
                      isCurrent
                        ? 'bg-terracotta-600 text-white border-terracotta-600 shadow-sm'
                        : isPast
                        ? 'bg-[#edf4e8] text-[#2d4f1e] border-[#c1d9b7]'
                        : 'bg-earth-50 text-earth-600 border-earth-200'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      Stage {idx + 1}
                    </div>
                    <div>{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Bar (Operational Next Steps) */}
        <div className="bg-espresso-950 rounded-xl p-4 text-earth-100 shadow-md flex flex-wrap items-center justify-between gap-3 border border-espresso-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terracotta-400 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-earth-300">
              Valid Operational Next Steps:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status transitions based on current status */}
            {request.status === 'NEW' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsClarificationModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-700 hover:bg-amber-600 text-white transition shadow"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Request Clarification</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('READY_TO_ASSIGN')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-clay-700 hover:bg-clay-600 text-white transition shadow"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Ready to Assign</span>
                </button>
              </>
            )}

            {request.status === 'NEEDS_CLARIFICATION' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('READY_TO_ASSIGN')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-clay-700 hover:bg-clay-600 text-white transition shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clarification Received &rarr; Ready to Assign</span>
              </button>
            )}

            {request.status === 'READY_TO_ASSIGN' && (
              <button
                type="button"
                onClick={() => {
                  if (!request.assigneeId) {
                    setActionError('Please select and assign a team member below before starting work.');
                    return;
                  }
                  handleStatusTransition('IN_PROGRESS');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-terracotta-600 hover:bg-terracotta-500 text-white transition shadow"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Start Work (In Progress)</span>
              </button>
            )}

            {request.status === 'IN_PROGRESS' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsWaitingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-800 hover:bg-amber-700 text-white transition shadow"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mark Waiting on Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('DONE')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#3f6212] hover:bg-[#4d7c0f] text-white transition shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Request (Done)</span>
                </button>
              </>
            )}

            {request.status === 'WAITING_ON_CLIENT' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsClientResponseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-clay-700 hover:bg-clay-600 text-white transition shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Client Responded &rarr; Resume Work</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusTransition('DONE')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#3f6212] hover:bg-[#4d7c0f] text-white transition shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Request (Done)</span>
                </button>
              </>
            )}

            {request.status === 'DONE' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('IN_PROGRESS')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-espresso-800 hover:bg-espresso-700 text-earth-200 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-open Request</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Context & Assignments | Follow-ups & Activity History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Context & Assignment Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waiting Context Banner (if waiting on client) */}
            {request.status === 'WAITING_ON_CLIENT' && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Currently Waiting on Client</span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {request.waitingReason || 'Awaiting required client input or external dependency.'}
                </p>
                <p className="text-[11px] text-amber-800 italic font-medium">
                  Note: Internal overdue rules are suspended while waiting on the client.
                </p>
              </div>
            )}

            {/* Request Description / Captured Communication */}
            <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-earth-800 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-earth-500" />
                <span>Captured Request Context</span>
              </div>
              <div className="p-4 bg-earth-50 border border-earth-200 rounded-lg text-xs text-espresso-950 whitespace-pre-wrap leading-relaxed">
                {request.description}
              </div>
            </div>

            {/* Assignment Management Card */}
            <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-earth-800 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-terracotta-700" />
                  <span>Assignment & Ownership</span>
                </div>
                <span className="text-[11px] text-earth-500">
                  {isManager ? 'Manager permission enabled' : 'Assigned operator view'}
                </span>
              </div>

              {isManager ? (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-earth-800">
                    Assign or Reassign Team Member:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={request.assigneeId || ''}
                      onChange={(e) => handleAssign(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:ring-2 focus:ring-terracotta-500 focus:outline-none text-earth-900 font-medium"
                    >
                      <option value="">-- Unassigned --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-earth-500">
                    Rule: Work cannot transition to <em>In Progress</em> unless assigned to a team member.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-earth-50 rounded-lg border border-earth-200 text-xs">
                  <div>
                    <span className="text-earth-600">Assigned To: </span>
                    <strong className="text-espresso-950">
                      {request.assignee?.name || 'Unassigned'}
                    </strong>
                  </div>
                  {!request.assignee && currentUser && (
                    <button
                      type="button"
                      onClick={() => handleAssign(currentUser.id)}
                      className="px-3 py-1 bg-terracotta-600 text-white rounded text-xs font-semibold hover:bg-terracotta-500 transition"
                    >
                      Claim Request
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Follow-Ups Management Card */}
            <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-earth-800 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-terracotta-700" />
                  <span>Follow-Up Actions ({request.followUps?.length || 0})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-terracotta-800 hover:text-terracotta-950 font-semibold bg-terracotta-50 hover:bg-terracotta-100 px-2.5 py-1 rounded transition border border-terracotta-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Follow-Up</span>
                </button>
              </div>

              <div className="space-y-2">
                {!request.followUps || request.followUps.length === 0 ? (
                  <p className="text-xs text-earth-400 italic py-2">
                    No follow-ups scheduled yet. Add one to ensure this client request does not get forgotten.
                  </p>
                ) : (
                  request.followUps.map((fu) => {
                    const isCompleted = Boolean(fu.completedAt);
                    return (
                      <div
                        key={fu.id}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 transition ${
                          isCompleted
                            ? 'bg-earth-50/70 border-earth-200 text-earth-400'
                            : fu.status === 'MISSED'
                            ? 'bg-rose-50 border-rose-300 text-rose-950'
                            : fu.status === 'DUE'
                            ? 'bg-amber-50 border-amber-300 text-amber-950'
                            : 'bg-white border-earth-200 text-espresso-950'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => handleToggleFollowUp(fu.id, isCompleted)}
                            className="mt-0.5 rounded border-earth-300 text-terracotta-600 focus:ring-terracotta-500"
                            title="Mark follow-up completed"
                          />
                          <div>
                            <div className={`font-medium ${isCompleted ? 'line-through text-earth-400' : ''}`}>
                              {fu.note}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-earth-600 mt-1">
                              <span>Owner: <strong className="text-earth-900">{fu.owner?.name}</strong></span>
                              <span>Target: {format(new Date(fu.scheduledAt), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <FollowUpBadge followUp={fu} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Complete Activity Timeline / Audit Trail */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-earth-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-earth-800 uppercase tracking-wider">
                  <History className="w-4 h-4 text-earth-500" />
                  <span>Activity History</span>
                </div>
                <span className="text-[11px] text-earth-500 font-medium">
                  {request.activities?.length || 0} events
                </span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record an operational update or internal note..."
                  className="w-full text-xs p-2.5 bg-earth-50 border border-earth-300 rounded-md focus:ring-2 focus:ring-terracotta-500 focus:outline-none text-espresso-950"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-espresso-950 hover:bg-espresso-900 text-earth-100 rounded text-xs font-semibold shadow transition disabled:opacity-40"
                  >
                    <Send className="w-3 h-3 text-terracotta-400" />
                    <span>{isAddingNote ? 'Saving...' : 'Add Note'}</span>
                  </button>
                </div>
              </form>

              {/* Timeline Items */}
              <div className="relative pl-4 space-y-4 border-l-2 border-earth-200 pt-2">
                {request.activities?.map((act) => {
                  return (
                    <div key={act.id} className="relative group text-xs">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-terracotta-600 ring-4 ring-white"></span>
                      <div>
                        <div className="text-[11px] text-earth-500 flex items-center justify-between">
                          <span>{format(new Date(act.createdAt), 'MMM d, HH:mm')}</span>
                          {act.actor && (
                            <span className="font-semibold text-earth-800">{act.actor.name}</span>
                          )}
                        </div>
                        <div className="font-medium text-espresso-950 mt-0.5 leading-snug">
                          {act.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Workflow Modals */}
      <WaitingReasonModal
        isOpen={isWaitingModalOpen}
        onClose={() => setIsWaitingModalOpen(false)}
        onSubmit={(reason) => handleStatusTransition('WAITING_ON_CLIENT', reason)}
      />

      <ClarificationModal
        isOpen={isClarificationModalOpen}
        onClose={() => setIsClarificationModalOpen(false)}
        onSubmit={(details) => handleStatusTransition('NEEDS_CLARIFICATION', details)}
      />

      <ClientResponseModal
        isOpen={isClientResponseModalOpen}
        onClose={() => setIsClientResponseModalOpen(false)}
        onSubmit={(note) => handleStatusTransition('IN_PROGRESS', undefined, note)}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSubmit={handleCreateFollowUp}
      />
    </div>
  );
}
