'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  PlusCircle, 
  AlertTriangle, 
  Layers, 
  Grid, 
  List, 
  ArrowRight,
  FileText 
} from 'lucide-react';
import IncidentCard from '@/components/IncidentCard';
import SLATimerBadge from '@/components/SLATimerBadge';
import { useIncidentStore } from '@/lib/store';
import { Severity, IncidentStatus } from '@/lib/types';

export default function IncidentsPage() {
  const { isLoaded, incidents, createIncident } = useIncidentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Manual incident creation state
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSev, setNewSev] = useState<Severity>('P2');
  const [newService, setNewService] = useState('Payments Engine');

  if (!isLoaded) return null;

  const filtered = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    return matchesSearch && matchesSev && matchesStatus;
  });

  const handleCreateManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    createIncident({
      title: newTitle.trim(),
      description: newDesc.trim(),
      severity: newSev,
      service: newService,
      source: 'user',
    });

    setIsCreatingManual(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Incident Directory & Log</h1>
          <p className="mt-1 text-xs text-gray-400">
            Comprehensive history and live status tracking across all company microservices
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/incidents/create-iof"
            className="flex items-center space-x-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-md shadow-cyan-500/10"
          >
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>IOF Wizard</span>
          </Link>

          <button
            onClick={() => setIsCreatingManual(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-rose-500 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, title, or service..."
            className="w-full rounded-xl border border-gray-800 bg-gray-950 pl-9 pr-4 py-2 text-xs text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-gray-400 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value as any)}
            className="rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-200 focus:border-red-500 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="P1">P1 Critical</option>
            <option value="P2">P2 High</option>
            <option value="P3">P3 Medium</option>
            <option value="P4">P4 Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-gray-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-200 focus:border-red-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="triggered">Triggered</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="identified">Identified</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 rounded-xl bg-gray-950 p-1 border border-gray-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Directory Grid / Table Output */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map(inc => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-800 bg-gray-950 text-gray-400">
              <tr>
                <th className="p-3.5 font-semibold">ID & Priority</th>
                <th className="p-3.5 font-semibold">Incident Title</th>
                <th className="p-3.5 font-semibold">Service</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">SLA Timers</th>
                <th className="p-3.5 font-semibold">Commander</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map(inc => (
                <tr key={inc.id} className="hover:bg-gray-900/80 transition-colors">
                  <td className="p-3.5 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'P1' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-gray-300 font-bold">{inc.id}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-gray-100 max-w-xs truncate">
                    {inc.title}
                  </td>
                  <td className="p-3.5 text-gray-400">{inc.service}</td>
                  <td className="p-3.5">
                    <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-800 text-gray-300">
                      {inc.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <SLATimerBadge incident={inc} type="TTR" compact />
                  </td>
                  <td className="p-3.5 text-gray-300">{inc.assignedTo.name}</td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/incidents/${inc.id}`}
                      className="inline-flex items-center space-x-1 font-semibold text-red-400 hover:underline"
                    >
                      <span>War Room</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Declare Modal */}
      {isCreatingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-red-500" />
              <span>Declare New Manual Incident</span>
            </h2>

            <form onSubmit={handleCreateManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Incident Summary Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Auth Gateway high error rate..."
                  className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Description & Observed Behavior</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Describe failure symptoms, affected endpoints, and impact..."
                  className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Severity</label>
                  <select
                    value={newSev}
                    onChange={e => setNewSev(e.target.value as Severity)}
                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-red-500 focus:outline-none"
                  >
                    <option value="P1">P1 Critical</option>
                    <option value="P2">P2 High</option>
                    <option value="P3">P3 Medium</option>
                    <option value="P4">P4 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Impacted Service</label>
                  <input
                    type="text"
                    required
                    value={newService}
                    onChange={e => setNewService(e.target.value)}
                    className="w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-gray-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingManual(false)}
                  className="rounded-xl border border-gray-800 px-4 py-2 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-500"
                >
                  Declare & Page On-Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
