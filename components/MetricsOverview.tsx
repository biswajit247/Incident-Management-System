'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  Users, 
  Zap 
} from 'lucide-react';
import { useIncidentStore } from '@/lib/store';

export default function MetricsOverview() {
  const { incidents, shifts } = useIncidentStore();

  const totalIncidents = incidents.length;
  const activeP1 = incidents.filter(i => i.severity === 'P1' && i.status !== 'resolved').length;
  const activeUnacked = incidents.filter(i => i.status === 'triggered').length;
  const totalActive = incidents.filter(i => i.status !== 'resolved').length;

  // Calculate MTTA (Mean Time to Acknowledge)
  const ackedIncidents = incidents.filter(i => i.acknowledgedAt);
  let totalTtaMs = 0;
  ackedIncidents.forEach(i => {
    totalTtaMs += new Date(i.acknowledgedAt!).getTime() - new Date(i.createdAt).getTime();
  });
  const mttaMins = ackedIncidents.length > 0 ? Math.round(totalTtaMs / (ackedIncidents.length * 60 * 1000)) : 3;

  // Calculate MTTR (Mean Time to Resolve)
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' && i.resolvedAt);
  let totalTtrMs = 0;
  resolvedIncidents.forEach(i => {
    totalTtrMs += new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime();
  });
  const mttrMins = resolvedIncidents.length > 0 ? Math.round(totalTtrMs / (resolvedIncidents.length * 60 * 1000)) : 42;

  // SLA Compliance Rate
  const totalBreaches = incidents.filter(i => i.ttaBreached || i.ttrBreached).length;
  const slaCompliance = totalIncidents > 0 ? Math.round(((totalIncidents - totalBreaches) / totalIncidents) * 100) : 98;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      
      {/* Active P1s */}
      <div className={`rounded-xl border p-4 backdrop-blur-md transition-all ${
        activeP1 > 0 
          ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10' 
          : 'border-gray-800 bg-gray-900/60'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">ACTIVE P1s</span>
          <ShieldAlert className={`h-4 w-4 ${activeP1 > 0 ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className={`text-2xl font-black ${activeP1 > 0 ? 'text-red-400' : 'text-gray-100'}`}>
            {activeP1}
          </span>
          <span className="text-[10px] text-gray-400">Critical</span>
        </div>
      </div>

      {/* Unacknowledged Alerts */}
      <div className={`rounded-xl border p-4 backdrop-blur-md transition-all ${
        activeUnacked > 0 
          ? 'border-amber-500/50 bg-amber-500/10' 
          : 'border-gray-800 bg-gray-900/60'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">UNACKNOWLEDGED</span>
          <AlertTriangle className={`h-4 w-4 ${activeUnacked > 0 ? 'text-amber-400 animate-bounce' : 'text-gray-500'}`} />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className={`text-2xl font-black ${activeUnacked > 0 ? 'text-amber-300' : 'text-gray-100'}`}>
            {activeUnacked}
          </span>
          <span className="text-[10px] text-gray-400">Needs Triage</span>
        </div>
      </div>

      {/* MTTA */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">MTTA</span>
          <Clock className="h-4 w-4 text-blue-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-black text-gray-100">{mttaMins}</span>
          <span className="text-xs font-medium text-gray-400">mins</span>
        </div>
        <p className="mt-1 text-[10px] text-emerald-400 font-medium">↓ 1.2m vs last week</p>
      </div>

      {/* MTTR */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">MTTR</span>
          <Zap className="h-4 w-4 text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-black text-gray-100">{mttrMins}</span>
          <span className="text-xs font-medium text-gray-400">mins</span>
        </div>
        <p className="mt-1 text-[10px] text-emerald-400 font-medium">↓ 4.5m vs last week</p>
      </div>

      {/* SLA Compliance */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">SLA TARGET</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-black text-emerald-400">{slaCompliance}%</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-400 font-medium">Target: &gt; 95%</p>
      </div>

      {/* Active On-Call Shifts */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">ON-CALL TEAMS</span>
          <Users className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-black text-cyan-300">{shifts.length}</span>
          <span className="text-xs text-gray-400">Active</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-400 font-medium">Auto-routing active</p>
      </div>

    </div>
  );
}
