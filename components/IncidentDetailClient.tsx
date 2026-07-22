'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck,
  ArrowLeft, 
  Video, 
  FileText, 
  Radio, 
  Activity, 
  Plus
} from 'lucide-react';
import WarRoomChat from '@/components/WarRoomChat';
import SLATimerBadge from '@/components/SLATimerBadge';
import RcaEditor from '@/components/RcaEditor';
import IncidentOccurrenceFormModal from '@/components/IncidentOccurrenceFormModal';
import TelemetryChart from '@/components/TelemetryChart';
import { useIncidentStore } from '@/lib/store';
import { MOCK_RESPONDERS } from '@/lib/mockData';
import { IncidentStatus } from '@/lib/types';

interface IncidentDetailClientProps {
  id: string;
}

export default function IncidentDetailClient({ id }: IncidentDetailClientProps) {
  const router = useRouter();

  const { 
    isLoaded, 
    incidents, 
    allIncidents,
    timelineEvents, 
    updateIncidentStatus, 
    reassignResponder,
    addTimelineNote,
    rcaReports
  } = useIncidentStore();

  const [activeTab, setActiveTab] = useState<'warroom' | 'timeline' | 'rca'>('warroom');
  const [noteInput, setNoteInput] = useState('');
  const [isIofModalOpen, setIsIofModalOpen] = useState(false);

  if (!isLoaded) return null;

  const incident = (allIncidents || incidents).find(i => 
    i.id === id || 
    i.id === `PRO-${id.replace('INC-', '')}` || 
    i.id === `INC-${id.replace('PRO-', '')}`
  );

  if (!incident) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-12 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-3 text-lg font-bold text-white">Incident {id} Not Found</h2>
        <p className="mt-1 text-xs text-gray-400">The requested incident ID does not exist in the active store.</p>
        <Link href="/incidents" className="mt-4 inline-block rounded-xl bg-gray-800 px-4 py-2 text-xs font-semibold text-white">
          ← Back to Incident Directory
        </Link>
      </div>
    );
  }

  const events = timelineEvents[incident.id] || [];
  const existingRca = rcaReports.find(r => r.incidentId === incident.id);

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addTimelineNote(incident.id, incident.assignedTo.name, noteInput.trim());
    setNoteInput('');
  };

  const statusWorkflowOptions: { status: IncidentStatus; label: string }[] = [
    { status: 'triggered', label: 'Triggered' },
    { status: 'acknowledged', label: 'Acknowledged' },
    { status: 'investigating', label: 'Investigating' },
    { status: 'identified', label: 'Identified' },
    { status: 'monitoring', label: 'Monitoring' },
    { status: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Back Nav & Quick Info */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center space-x-2">
          <SLATimerBadge incident={incident} type="TTA" />
          <SLATimerBadge incident={incident} type="TTR" />
        </div>
      </div>

      {/* Main Incident Command Banner Header */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-md">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                incident.severity === 'P1' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {incident.severity} CRITICAL
              </span>
              <span className="font-mono text-sm font-bold text-gray-400">{incident.id}</span>
              <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-semibold text-gray-300">
                {incident.service}
              </span>
              <span className="rounded bg-gray-800/60 px-2 py-0.5 text-[10px] font-mono uppercase text-gray-400">
                Source: {incident.source}
              </span>
            </div>

            <h1 className="mt-2 text-xl font-bold text-white">{incident.title}</h1>
            <p className="mt-1 text-xs text-gray-300">{incident.description}</p>
          </div>

          {/* Commander & Video Link */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Commander Reassignment Selector */}
            <div className="flex items-center space-x-2 rounded-xl border border-gray-800 bg-gray-950 p-2 text-xs">
              <img
                src={incident.assignedTo.avatar}
                alt={incident.assignedTo.name}
                className="h-6 w-6 rounded-full border border-gray-700 object-cover"
              />
              <div className="text-left">
                <span className="block text-[9px] font-bold text-gray-500 uppercase">Incident Commander</span>
                <select
                  value={incident.assignedTo.id}
                  onChange={(e) => {
                    const newResp = MOCK_RESPONDERS.find(r => r.id === e.target.value);
                    if (newResp) reassignResponder(incident.id, newResp, 'Ops Lead');
                  }}
                  className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
                >
                  {MOCK_RESPONDERS.map(r => (
                    <option key={r.id} value={r.id} className="bg-gray-900 text-gray-200">
                      {r.name} ({r.team})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enterprise IOF Form Button */}
            <button
              onClick={() => setIsIofModalOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm shadow-cyan-500/10"
            >
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Compliance Form (IOF)</span>
            </button>

            {/* Video Bridge Button */}
            {incident.videoBridgeUrl && (
              <a
                href={incident.videoBridgeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20"
              >
                <Video className="h-4 w-4 animate-pulse" />
                <span>Join Video Bridge</span>
              </a>
            )}
          </div>
        </div>

        {/* Workflow State Progression Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
          <span className="font-bold text-gray-400 text-xs">Lifecycle State Workflow:</span>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {statusWorkflowOptions.map((opt) => {
              const isActive = incident.status === opt.status;
              return (
                <button
                  key={opt.status}
                  onClick={() => updateIncidentStatus(incident.id, opt.status, incident.assignedTo.name)}
                  className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
                      : 'border border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Live Telemetry Graphic */}
      <TelemetryChart metrics={incident.affectedMetrics || {}} service={incident.service} />

      {/* Mode Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('warroom')}
          className={`flex items-center space-x-2 border-b-2 px-4 py-2 font-bold transition-colors ${
            activeTab === 'warroom'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Live War Room & Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center space-x-2 border-b-2 px-4 py-2 font-bold transition-colors ${
            activeTab === 'timeline'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Audit Trail Timeline ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rca')}
          className={`flex items-center space-x-2 border-b-2 px-4 py-2 font-bold transition-colors ${
            activeTab === 'rca'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Root Cause Analysis (RCA)</span>
          {existingRca && (
            <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 text-[10px]">
              Completed
            </span>
          )}
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'warroom' && (
        <WarRoomChat incident={incident} />
      )}

      {activeTab === 'timeline' && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="font-bold text-white text-base">Incident Audit Trail Log</h3>
            <span className="text-xs text-gray-400">Immutable chronological event log</span>
          </div>

          {/* Add Timeline Note Form */}
          <form onSubmit={handleAddNoteSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              placeholder="Add entry or key observation to official timeline audit log..."
              className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-4 py-2 text-xs text-gray-100 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center space-x-1 rounded-xl bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Event Note</span>
            </button>
          </form>

          {/* Timeline Feed */}
          <div className="relative border-l-2 border-gray-800 pl-6 space-y-6 ml-3">
            {events.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gray-950 border-2 border-red-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                </div>

                <div className="rounded-xl border border-gray-800/80 bg-gray-950/60 p-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-red-400">{event.author}</span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed">{event.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rca' && (
        <RcaEditor incident={incident} existingRca={existingRca} />
      )}

      {isIofModalOpen && (
        <IncidentOccurrenceFormModal incident={incident} onClose={() => setIsIofModalOpen(false)} />
      )}

    </div>
  );
}
