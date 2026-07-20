'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2, 
  Radio, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { Incident, Severity, IncidentStatus } from '@/lib/types';
import SLATimerBadge from './SLATimerBadge';
import { useIncidentStore } from '@/lib/store';

interface IncidentCardProps {
  incident: Incident;
}

const severityConfig: Record<Severity, { label: string; badgeClass: string; bgGlow: string }> = {
  P1: {
    label: 'P1 CRITICAL',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/50 shadow-sm shadow-red-500/20 animate-pulse',
    bgGlow: 'hover:border-red-500/40 hover:shadow-red-500/10',
  },
  P2: {
    label: 'P2 HIGH',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    bgGlow: 'hover:border-orange-500/40 hover:shadow-orange-500/10',
  },
  P3: {
    label: 'P3 MEDIUM',
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    bgGlow: 'hover:border-yellow-500/40 hover:shadow-yellow-500/10',
  },
  P4: {
    label: 'P4 LOW',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    bgGlow: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
  },
};

const statusConfig: Record<IncidentStatus, { label: string; class: string }> = {
  triggered: { label: 'Triggered', class: 'bg-red-950 text-red-400 border-red-800' },
  acknowledged: { label: 'Acknowledged', class: 'bg-amber-950 text-amber-300 border-amber-800' },
  investigating: { label: 'Investigating', class: 'bg-blue-950 text-blue-300 border-blue-800' },
  identified: { label: 'Identified', class: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
  monitoring: { label: 'Monitoring', class: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
  resolved: { label: 'Resolved', class: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
};

export default function IncidentCard({ incident }: IncidentCardProps) {
  const { acknowledgeIncident, updateIncidentStatus } = useIncidentStore();

  const sev = severityConfig[incident.severity];
  const st = statusConfig[incident.status];

  return (
    <div className={`group relative rounded-xl border border-gray-800/80 bg-gray-900/60 p-5 backdrop-blur-md transition-all duration-200 hover:bg-gray-900/90 hover:shadow-lg ${sev.bgGlow}`}>
      
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${sev.badgeClass}`}>
            {sev.label}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${st.class}`}>
            {st.label}
          </span>
          <span className="font-mono text-xs font-bold text-gray-400">
            {incident.id}
          </span>
        </div>

        {/* SLA Timers */}
        <div className="flex items-center space-x-2">
          <SLATimerBadge incident={incident} type="TTA" compact />
          <SLATimerBadge incident={incident} type="TTR" compact />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-3">
        <Link 
          href={`/incidents/${incident.id}`}
          className="group-hover:text-red-400 font-semibold text-gray-100 text-base leading-snug tracking-tight transition-colors line-clamp-2"
        >
          {incident.title}
        </Link>
        <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">
          {incident.description}
        </p>
      </div>

      {/* Metrics Row (if present) */}
      {incident.affectedMetrics && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-xs">
          {incident.affectedMetrics.errorRate && (
            <div className="flex items-center space-x-1 text-red-400 font-mono">
              <span className="text-gray-500">Error Rate:</span>
              <span className="font-bold">{incident.affectedMetrics.errorRate}</span>
            </div>
          )}
          {incident.affectedMetrics.latencyP99 && (
            <div className="flex items-center space-x-1 text-amber-400 font-mono">
              <span className="text-gray-500">P99 Latency:</span>
              <span className="font-bold">{incident.affectedMetrics.latencyP99}</span>
            </div>
          )}
          {incident.affectedMetrics.cpu && (
            <div className="flex items-center space-x-1 text-orange-400 font-mono">
              <span className="text-gray-500">CPU Usage:</span>
              <span className="font-bold">{incident.affectedMetrics.cpu}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer Info Row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800/40 text-xs">
        
        {/* Service & Ingestion Source */}
        <div className="flex items-center space-x-3 text-gray-400">
          <div className="flex items-center space-x-1.5">
            <Layers className="h-3.5 w-3.5 text-gray-500" />
            <span className="font-medium text-gray-300">{incident.service}</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center space-x-1 uppercase text-[10px] font-semibold tracking-wider text-gray-500">
            <Radio className="h-3 w-3 text-red-400" />
            <span>{incident.source}</span>
          </div>
        </div>

        {/* Responder & Quick Actions */}
        <div className="flex items-center space-x-3">
          
          {/* Assigned Responder */}
          <div className="flex items-center space-x-1.5" title={`Assigned: ${incident.assignedTo.name}`}>
            <img 
              src={incident.assignedTo.avatar} 
              alt={incident.assignedTo.name} 
              className="h-5 w-5 rounded-full border border-gray-700 object-cover"
            />
            <span className="text-xs text-gray-300 font-medium">{incident.assignedTo.name}</span>
          </div>

          {/* Action Button */}
          {incident.status === 'triggered' && (
            <button
              onClick={() => acknowledgeIncident(incident.id, 'Commander')}
              className="flex items-center space-x-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm shadow-amber-500/10"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Acknowledge</span>
            </button>
          )}

          {incident.status === 'acknowledged' && (
            <button
              onClick={() => updateIncidentStatus(incident.id, 'investigating', 'Commander')}
              className="flex items-center space-x-1 rounded-lg border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-all"
            >
              <span>Investigate</span>
            </button>
          )}

          <Link
            href={`/incidents/${incident.id}`}
            className="flex items-center space-x-1 rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-gray-700 hover:text-white transition-all"
          >
            <span>War Room</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

      </div>

    </div>
  );
}
