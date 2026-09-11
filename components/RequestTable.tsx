'use client';

import React from 'react';
import Link from 'next/link';
import { RequestItem } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { SourceBadge } from './SourceBadge';
import { FollowUpBadge } from './FollowUpBadge';
import { 
  Search, 
  UserX, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  FilterX,
  Building2,
  Inbox
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Props {
  requests: RequestItem[];
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  sourceFilter: string;
  setSourceFilter: (src: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (a: string) => void;
  onResetFilters: () => void;
  isLoading: boolean;
}

export function RequestTable({
  requests,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sourceFilter,
  setSourceFilter,
  assigneeFilter,
  setAssigneeFilter,
  onResetFilters,
  isLoading,
}: Props) {
  const hasActiveFilters =
    search ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    assigneeFilter !== 'ALL';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
      {/* Search and Filters Toolbar */}
      <div className="p-4 border-b border-earth-200 bg-earth-50/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, title, context..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-earth-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500 shadow-sm text-espresso-900"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-earth-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-earth-900 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New Request</option>
              <option value="NEEDS_CLARIFICATION">Needs Clarification</option>
              <option value="READY_TO_ASSIGN">Ready to Assign</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_ON_CLIENT">Waiting on Client</option>
              <option value="DONE">Done</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-earth-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-earth-900 font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-earth-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-earth-900 font-medium"
            >
              <option value="ALL">All Sources</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-white border border-earth-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-earth-900 font-medium"
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned Only</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs text-terracotta-700 hover:text-terracotta-900 py-1.5 px-2 font-semibold"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-earth-100 text-earth-900 border-b border-earth-200 uppercase tracking-wider text-[10px] font-bold">
              <th className="py-3 px-4">Request & Client</th>
              <th className="py-3 px-3">Source</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Assignee</th>
              <th className="py-3 px-3">Due Date</th>
              <th className="py-3 px-3">Next Follow-Up</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-earth-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-terracotta-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading operational requests...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-earth-600">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <Inbox className="w-10 h-10 text-earth-300" />
                    <span className="font-semibold text-earth-900 text-sm">No requests found</span>
                    <p className="text-earth-500 text-xs text-center">
                      No operational requests match your current filters or search criteria.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-2 text-xs text-terracotta-700 font-semibold hover:underline"
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                return (
                  <tr
                    key={req.id}
                    className="hover:bg-earth-50/80 transition group cursor-pointer"
                  >
                    {/* Request & Client */}
                    <td className="py-3 px-4">
                      <Link href={`/requests/${req.id}`} className="block">
                        <div className="font-semibold text-espresso-900 group-hover:text-terracotta-700 transition">
                          {req.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-earth-600 mt-0.5">
                          <Building2 className="w-3 h-3 text-earth-400" />
                          <span>{req.client?.name}</span>
                        </div>
                      </Link>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <SourceBadge source={req.source} />
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {req.assignee ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-earth-900">
                          <span className="w-5 h-5 rounded-full bg-earth-200 text-earth-800 flex items-center justify-center text-[10px] font-bold">
                            {req.assignee.name.charAt(0)}
                          </span>
                          <span>{req.assignee.name}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100/70 text-amber-900 border border-amber-300">
                          <UserX className="w-3 h-3 text-amber-700" />
                          <span>Unassigned</span>
                        </span>
                      )}
                    </td>

                    {/* Due Date & Overdue logic */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {req.dueAt ? (
                        <div>
                          <div
                            className={`flex items-center gap-1 font-medium ${
                              req.isOverdue
                                ? 'text-rose-800 font-bold'
                                : 'text-earth-900'
                            }`}
                          >
                            <Calendar className="w-3 h-3 text-earth-400" />
                            <span>{format(new Date(req.dueAt), 'MMM d, yyyy')}</span>
                          </div>
                          {req.isOverdue && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-700 font-bold uppercase mt-0.5">
                              <AlertCircle className="w-3 h-3" />
                              <span>Overdue</span>
                            </span>
                          )}
                          {req.status === 'WAITING_ON_CLIENT' && (
                            <span className="text-[10px] text-amber-800 font-medium block mt-0.5">
                              (Paused: Waiting)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-earth-400 italic">No deadline</span>
                      )}
                    </td>

                    {/* Next Follow-up */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <FollowUpBadge followUp={req.nextFollowUp} />
                    </td>

                    {/* Last Activity */}
                    <td className="py-3 px-4 max-w-xs">
                      {req.lastActivity ? (
                        <div>
                          <div className="truncate text-earth-800 font-medium">
                            {req.lastActivity.message}
                          </div>
                          <div className="text-[10px] text-earth-500">
                            {formatDistanceToNow(new Date(req.lastActivity.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-earth-400 italic">No activity</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link
                        href={`/requests/${req.id}`}
                        className="inline-flex items-center gap-1 text-earth-700 hover:text-terracotta-700 font-semibold p-1 rounded hover:bg-earth-100 transition"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="py-2.5 px-4 bg-earth-50 border-t border-earth-200 flex items-center justify-between text-[11px] text-earth-600">
        <div>
          Showing <span className="font-semibold text-earth-900">{requests.length}</span> request
          {requests.length === 1 ? '' : 's'}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-terracotta-600"></span>
            Operational safety net active
          </span>
        </div>
      </div>
    </div>
  );
}
