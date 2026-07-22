'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Activity, 
  Radio, 
  Users, 
  ArrowRight, 
  Flame, 
  Filter 
} from 'lucide-react';
import MetricsOverview from '@/components/MetricsOverview';
import IncidentCard from '@/components/IncidentCard';
import { useIncidentStore } from '@/lib/store';
import { Severity } from '@/lib/types';
import AlertSimulatorModal from '@/components/AlertSimulatorModal';

export default function DashboardPage() {
  const { isLoaded, incidents, shifts, notifications } = useIncidentStore();
  const [selectedTab, setSelectedTab] = useState<'all' | 'P1' | 'P2' | 'unacked'>('all');
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center space-x-2 text-gray-400 font-mono text-xs">
        <Activity className="h-5 w-5 animate-spin text-red-500" />
        <span>Loading Sentinel Incident Control Center...</span>
      </div>
    );
  }

  const unacknowledgedIncidents = incidents.filter(i => i.status === 'triggered');
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalP1s = incidents.filter(i => i.severity === 'P1' && i.status !== 'resolved');

  const filteredIncidents = activeIncidents.filter(inc => {
    if (selectedTab === 'P1') return inc.severity === 'P1';
    if (selectedTab === 'P2') return inc.severity === 'P2';
    if (selectedTab === 'unacked') return inc.status === 'triggered';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Incident Command Center</h1>
            <span className="rounded bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 text-xs font-semibold">
              REAL-TIME OPS
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Live monitoring telemetry, automatic SLA breach detection, on-call alert dispatching & war room control
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSimModalOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-amber-500 transition-all"
          >
            <Radio className="h-4 w-4 animate-pulse" />
            <span>+ Dispatch Telemetry Alert</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview Row */}
      <MetricsOverview />

      {/* Critical P1 Emergency Alert Banner (if active P1s exist) */}
      {criticalP1s.length > 0 && (
        <div className="rounded-2xl border border-red-500/60 bg-red-950/40 p-4 shadow-xl shadow-red-500/10 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-md">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-red-200 text-sm">
                  CRITICAL P1 OUTAGE IN PROGRESS ({criticalP1s.length})
                </h3>
                <p className="text-xs text-red-300/80">
                  {criticalP1s[0].title}
                </p>
              </div>
            </div>
            <Link
              href={`/incidents/${criticalP1s[0].id}`}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-md shadow-red-600/30"
            >
              Enter War Room →
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column Incidents, Right Column On-Call & Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Active Incidents Feed */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Header & Filter Tabs */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <h2 className="font-bold text-white text-base">Active Incident Stream</h2>
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-bold text-gray-300">
                {filteredIncidents.length}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 rounded-xl bg-gray-900 p-1 text-xs border border-gray-800">
              <button
                onClick={() => setSelectedTab('all')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  selectedTab === 'all' ? 'bg-gray-800 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                All Active ({activeIncidents.length})
              </button>
              <button
                onClick={() => setSelectedTab('unacked')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  selectedTab === 'unacked' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Unacked ({unacknowledgedIncidents.length})
              </button>
              <button
                onClick={() => setSelectedTab('P1')}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  selectedTab === 'P1' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                P1 Only ({activeIncidents.filter(i => i.severity === 'P1').length})
              </button>
            </div>
          </div>

          {/* Incidents List */}
          {filteredIncidents.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <h3 className="mt-2 font-bold text-white text-sm">No Active Incidents matching filter</h3>
              <p className="mt-1 text-xs text-gray-400">All systems operating within normal performance bounds</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIncidents.map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Active On-Call Responders & Notification Dispatch Feed */}
        <div className="space-y-6">
          
          {/* Active On-Call Roster Widget */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Current On-Call Responders</h3>
              </div>
              <Link href="/schedules" className="text-xs font-semibold text-cyan-400 hover:underline">
                View Shifts →
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {shifts.map((shift) => (
                <div key={shift.id} className="rounded-xl border border-gray-800/80 bg-gray-950/60 p-3">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-gray-300">{shift.service}</span>
                    <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400">
                      Tier 1 Primary
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={shift.tier1.avatar}
                      alt={shift.tier1.name}
                      className="h-7 w-7 rounded-full border border-gray-700 object-cover"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{shift.tier1.name}</p>
                      <p className="text-[10px] text-gray-400">{shift.tier1.role} • {shift.tier1.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Notification Pager Log Widget */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm">Alert Dispatch Log</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Twilio / SMS</span>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">No recent pager dispatches logged.</p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="rounded-lg border border-gray-800 bg-gray-950/80 p-2.5 text-[11px]">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="font-bold text-amber-300">{n.channel} ➔ {n.recipientName}</span>
                      <span className="text-[9px] font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-1 text-gray-300 line-clamp-2">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {isSimModalOpen && (
        <AlertSimulatorModal onClose={() => setIsSimModalOpen(false)} />
      )}
    </div>
  );
}
