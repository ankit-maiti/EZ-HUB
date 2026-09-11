'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Clock, HelpCircle, MessageSquare, Calendar, AlertCircle } from 'lucide-react';

interface WaitingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export function WaitingReasonModal({ isOpen, onClose, onSubmit }: WaitingModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please specify what information or action is being awaited from the client.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-earth-300 w-full max-w-md overflow-hidden">
        <div className="px-5 py-3.5 bg-amber-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-200" />
            <h3 className="font-bold text-sm">Mark Waiting on Client</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-amber-900 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 bg-[#faf8f5]">
          <p className="text-xs text-earth-700">
            Requests marked <strong className="text-amber-950">Waiting on Client</strong> are paused from internal overdue calculations until the client responds.
          </p>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1">
              What is awaited from the client? *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Awaiting updated API webhook secret key and schema sample from their tech lead..."
              className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:ring-2 focus:ring-amber-600 focus:outline-none text-earth-900"
              autoFocus
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-earth-800 border border-earth-300 rounded-md hover:bg-earth-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-700 rounded-md shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Waiting on Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: string) => Promise<void>;
}

export function ClarificationModal({ isOpen, onClose, onSubmit }: ClarificationModalProps) {
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide the clarification details.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(details.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-earth-300 w-full max-w-md overflow-hidden">
        <div className="px-5 py-3.5 bg-terracotta-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-terracotta-200" />
            <h3 className="font-bold text-sm">Request Clarification</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-terracotta-800 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 bg-[#faf8f5]">
          <p className="text-xs text-earth-700">
            Flag this request as needing clarification before it can be assigned or worked on.
          </p>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1">
              What details are ambiguous or missing? *
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Client mentioned 'export data' but didn't specify date range or department..."
              className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:ring-2 focus:ring-terracotta-600 focus:outline-none text-earth-900"
              autoFocus
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-earth-800 border border-earth-300 rounded-md hover:bg-earth-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-terracotta-700 hover:bg-terracotta-600 rounded-md shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Mark Needs Clarification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ClientResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (responseNote: string) => Promise<void>;
}

export function ClientResponseModal({ isOpen, onClose, onSubmit }: ClientResponseModalProps) {
  const [responseNote, setResponseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(responseNote.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-earth-300 w-full max-w-md overflow-hidden">
        <div className="px-5 py-3.5 bg-clay-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-clay-200" />
            <h3 className="font-bold text-sm">Resume Work (Client Responded)</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-clay-800 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 bg-[#faf8f5]">
          <p className="text-xs text-earth-700">
            Resuming work moves this request back to <strong className="text-clay-950">In Progress</strong> and logs the client response into the operational timeline.
          </p>

          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1">
              Client Response Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              placeholder="e.g. Client sent updated credentials via WhatsApp and confirmed readiness..."
              className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:ring-2 focus:ring-clay-600 focus:outline-none text-earth-900"
              autoFocus
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-earth-800 border border-earth-300 rounded-md hover:bg-earth-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-clay-700 hover:bg-clay-600 rounded-md shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Resuming...' : 'Resume In Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { ownerId: string; scheduledAt: string; note: string }) => Promise<void>;
}

export function FollowUpModal({ isOpen, onClose, onSubmit }: FollowUpModalProps) {
  const { currentUser, users } = useAuth();
  const [ownerId, setOwnerId] = useState(currentUser?.id || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId) {
      setError('Please assign an owner for this follow-up.');
      return;
    }
    if (!scheduledAt) {
      setError('Please select a scheduled date.');
      return;
    }
    if (!note.trim()) {
      setError('Please provide a follow-up action note.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ownerId,
        scheduledAt,
        note: note.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-earth-300 w-full max-w-md overflow-hidden">
        <div className="px-5 py-3.5 bg-espresso-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-terracotta-400" />
            <h3 className="font-bold text-sm">Schedule Follow-Up</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-espresso-900 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 bg-[#faf8f5]">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1">
              Follow-Up Owner *
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-white border border-earth-300 rounded-md text-earth-900 font-medium"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1">
              Scheduled Date *
            </label>
            <input
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-white border border-earth-300 rounded-md text-earth-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1">
              Action / Check-in Note *
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Check if client emailed the signed NDA; call if pending"
              className="w-full text-xs px-3 py-1.5 bg-white border border-earth-300 rounded-md text-earth-900"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-earth-800 border border-earth-300 rounded-md hover:bg-earth-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-terracotta-600 hover:bg-terracotta-500 rounded-md shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Follow-Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
