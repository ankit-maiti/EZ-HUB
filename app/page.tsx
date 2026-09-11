'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { TriageCards } from '@/components/TriageCards';
import { RequestTable } from '@/components/RequestTable';
import { RequestItem, TriageCounts } from '@/lib/types';
import { RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function OperationsDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [triageCounts, setTriageCounts] = useState<TriageCounts>({
    waitingForUs: 0,
    waitingForClient: 0,
    unassigned: 0,
    overdue: 0,
    totalActive: 0,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [selectedTriage, setSelectedTriage] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (sourceFilter !== 'ALL') params.set('source', sourceFilter);
      if (assigneeFilter !== 'ALL') params.set('assigneeId', assigneeFilter);
      if (selectedTriage) params.set('triage', selectedTriage);

      const res = await fetch(`/api/requests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        if (data.triageCounts) {
          setTriageCounts(data.triageCounts);
        }
      }
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, priorityFilter, sourceFilter, assigneeFilter, selectedTriage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSourceFilter('ALL');
    setAssigneeFilter('ALL');
    setSelectedTriage('');
  };

  const handleSelectTriage = (triageId: string) => {
    setSelectedTriage(triageId);
    setStatusFilter('ALL');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ee]">
      <Navbar onRequestCreated={fetchRequests} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Title & Live Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-espresso-950 tracking-tight">
                Operations Request Inbox
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-earth-200 text-earth-900 font-semibold border border-earth-300">
                {triageCounts.totalActive} Active
              </span>
            </div>
            <p className="text-xs text-earth-600 mt-0.5 font-medium">
              Live operational source of truth across WhatsApp, Email, and manual captures.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRequests()}
            disabled={isLoading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-earth-800 hover:text-earth-950 bg-white border border-earth-300 hover:border-earth-400 px-3 py-1.5 rounded-md shadow-sm transition disabled:opacity-50 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-terracotta-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Manager Triage Actionable Cards */}
        <TriageCards
          counts={triageCounts}
          selectedTriage={selectedTriage}
          onSelectTriage={handleSelectTriage}
        />

        {/* Operational Filterable Request Table */}
        <RequestTable
          requests={requests}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
