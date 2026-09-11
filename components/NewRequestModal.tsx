'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ClientItem } from '@/lib/types';
import { 
  X, 
  Plus, 
  MessageSquare, 
  Mail, 
  Layers, 
  AlertCircle,
  Calendar,
  UserCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewRequestModal({ isOpen, onClose, onSuccess }: Props) {
  const { currentUser, users } = useAuth();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<'WHATSAPP' | 'EMAIL' | 'OTHER'>('WHATSAPP');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
          if (data.length > 0 && !selectedClientId) {
            setSelectedClientId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    }
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isCreatingClient && !newClientName.trim()) {
      setError('Please provide a name for the new client.');
      return;
    }
    if (!isCreatingClient && !selectedClientId) {
      setError('Please select an existing client or create a new one.');
      return;
    }
    if (!title.trim()) {
      setError('Request title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Request description is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        source,
        priority,
        actorId: currentUser?.id,
        assigneeId: assigneeId || null,
        dueAt: dueDate ? new Date(dueDate).toISOString() : null,
      };

      if (isCreatingClient) {
        payload.clientName = newClientName.trim();
      } else {
        payload.clientId = selectedClientId;
      }

      if (hasFollowUp && followUpNote.trim() && followUpDate) {
        payload.initialFollowUpNote = followUpNote.trim();
        payload.initialFollowUpDate = new Date(followUpDate).toISOString();
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to capture request');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-earth-200 w-full max-w-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-espresso-950 text-white flex items-center justify-between border-b border-espresso-800">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terracotta-400"></span>
              Capture Operational Request
            </h2>
            <p className="text-xs text-earth-300 mt-0.5">
              Quickly record incoming requests from WhatsApp, Email, or calls
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-earth-400 hover:text-white transition p-1 rounded-md hover:bg-espresso-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-[#faf8f5]">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Client Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-earth-900">Client *</label>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingClient(!isCreatingClient);
                  setError('');
                }}
                className="text-xs text-terracotta-700 font-semibold hover:underline flex items-center gap-1"
              >
                {isCreatingClient ? 'Choose from existing' : '+ Add new client'}
              </button>
            </div>

            {isCreatingClient ? (
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="e.g. Apex Pharma Corp."
                className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                autoFocus
              />
            ) : (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500 text-earth-900 font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1.5">
              Request Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Invoice discrepancy in May warehouse batch"
              className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
              required
            />
          </div>

          {/* Source Channel & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-earth-900 mb-1.5">
                Channel Source *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSource('WHATSAPP')}
                  className={`flex flex-col items-center justify-center p-2 rounded-md border text-[11px] font-medium transition ${
                    source === 'WHATSAPP'
                      ? 'bg-[#edf4e8] text-[#2d4f1e] border-[#3f6212] ring-1 ring-[#3f6212]'
                      : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 mb-0.5 text-[#3f6212]" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSource('EMAIL')}
                  className={`flex flex-col items-center justify-center p-2 rounded-md border text-[11px] font-medium transition ${
                    source === 'EMAIL'
                      ? 'bg-clay-100 text-clay-900 border-clay-600 ring-1 ring-clay-600'
                      : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 mb-0.5 text-clay-700" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSource('OTHER')}
                  className={`flex flex-col items-center justify-center p-2 rounded-md border text-[11px] font-medium transition ${
                    source === 'OTHER'
                      ? 'bg-earth-200 text-espresso-950 border-earth-500 ring-1 ring-earth-500'
                      : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 mb-0.5 text-earth-600" />
                  <span>Other</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-900 mb-1.5">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500 text-earth-900 font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-earth-900 mb-1.5">
              Description / Raw Message Context *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste relevant details from WhatsApp conversation or email thread..."
              className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
              required
            />
          </div>

          {/* Optional Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4 pt-1 border-t border-earth-200">
            <div>
              <label className="block text-xs font-semibold text-earth-900 mb-1.5">
                Assignee (Optional)
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500 text-earth-900 font-medium"
              >
                <option value="">Leave Unassigned (New)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-900 mb-1.5">
                Target Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500 text-earth-900"
              />
            </div>
          </div>

          {/* Initial Follow-Up Toggle */}
          <div className="pt-2 border-t border-earth-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-earth-900 select-none">
              <input
                type="checkbox"
                checked={hasFollowUp}
                onChange={(e) => setHasFollowUp(e.target.checked)}
                className="rounded border-earth-300 text-terracotta-600 focus:ring-terracotta-500"
              />
              <span>Schedule an immediate follow-up</span>
            </label>

            {hasFollowUp && (
              <div className="mt-3 p-3 bg-earth-100/70 border border-earth-300 rounded-md space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-earth-800 mb-1">
                    Follow-Up Action Note *
                  </label>
                  <input
                    type="text"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="e.g. Call client for confirmation if no reply by tomorrow"
                    className="w-full text-xs px-3 py-1.5 border border-earth-300 rounded-md bg-white text-earth-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-earth-800 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-earth-300 rounded-md bg-white text-earth-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-earth-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-earth-800 bg-white border border-earth-300 rounded-md hover:bg-earth-100 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-terracotta-600 hover:bg-terracotta-500 active:bg-terracotta-700 rounded-md shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Capturing...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
