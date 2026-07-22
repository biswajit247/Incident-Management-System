'use client';

import React, { useState } from 'react';
import { BarChart3, Clock, CheckCircle2, ShieldAlert, TrendingDown, Layers, Zap } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';

export default function AnalyticsPage() {
  const { isLoaded, incidents, simulateSlaAnomalies } = useIncidentStore();
  const [isSimulating, setIsSimulating] = useState<'traffic' | 'breach' | 'reset' | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  const handleSimulate = (type: 'traffic' | 'breach' | 'reset') => {
    setIsSimulating(type);
    
    if (type === 'traffic') {
      setSimulationLog([
        'Initializing chaos testing sequence...',
        'Spawning connection pool load generators...',
        'Simulated telemetry reporting CPU 99%, active DB backend connections = 998.',
        'Active Lock contention on customer_accounts table generated.',
        'Prometheus Alert triggered & auto-routed to Tier 1 Responder successfully!'
      ]);
    } else if (type === 'breach') {
      setSimulationLog([
        'Initializing SLA violation simulation...',
        'Injecting active P1 Critical incident with custom retrofitted timestamp (45 minutes ago).',
        'Comparing incident duration against 5m TTA and 30m TTR SLA targets...',
        'SLA thresholds breached! Routing live escalation alerts to Executive Lead.',
        'SLA compliance metric updated live.'
      ]);
    } else {
      setSimulationLog([
        'Executing recovery sequence...',
        'Flushing synthetic incidents database cache...',
        'Baseline state restored. System status updated to: All Systems Operational.',
        'SLA targets compliant (100% SLA performance).'
      ]);
    }

    simulateSlaAnomalies(type);
    
    setTimeout(() => {
      setIsSimulating(null);
    }, 1000);
  };

  if (!isLoaded) return null;

  const total = incidents.length;
  const p1Count = incidents.filter(i => i.severity === 'P1').length;
  const p2Count = incidents.filter(i => i.severity === 'P2').length;
  const p3Count = incidents.filter(i => i.severity === 'P3').length;
  const p4Count = incidents.filter(i => i.severity === 'P4').length;

  const breaches = incidents.filter(i => i.ttaBreached || i.ttrBreached).length;
  const slaCompliancePct = total > 0 ? Math.round(((total - breaches) / total) * 100) : 98;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">SLA Performance & Reliability Metrics</h1>
          <p className="mt-1 text-xs text-gray-400">
            Analytics breakdown for Mean Time to Acknowledge (MTTA), Mean Time to Resolve (MTTR), and SLA targets
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold text-gray-400">TOTAL INCIDENTS</span>
          <p className="mt-2 text-3xl font-black text-white">{total}</p>
          <p className="mt-1 text-[10px] text-gray-400">Past 30 Days Telemetry</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold text-gray-400">SLA COMPLIANCE</span>
          <p className="mt-2 text-3xl font-black text-emerald-400">{slaCompliancePct}%</p>
          <p className="mt-1 text-[10px] text-emerald-400 font-semibold">✓ Exceeds 95% SLA Target</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold text-gray-400">AVG TTA (ACK TIME)</span>
          <p className="mt-2 text-3xl font-black text-blue-400">3.4 m</p>
          <p className="mt-1 text-[10px] text-emerald-400 font-semibold">↓ 1.2m improvement</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md">
          <span className="text-xs font-semibold text-gray-400">AVG TTR (RESOLVE TIME)</span>
          <p className="mt-2 text-3xl font-black text-purple-400">41.8 m</p>
          <p className="mt-1 text-[10px] text-emerald-400 font-semibold">↓ 6.5m improvement</p>
        </div>
      </div>

      {/* Visual Distribution Bar Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Severity Volume Distribution */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="font-bold text-white text-base">Incidents by Priority Severity</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-red-400">P1 Critical ({p1Count})</span>
                <span className="text-gray-400">{total > 0 ? Math.round((p1Count / total) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-950 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${total > 0 ? (p1Count / total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-orange-400">P2 High ({p2Count})</span>
                <span className="text-gray-400">{total > 0 ? Math.round((p2Count / total) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-950 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${total > 0 ? (p2Count / total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-yellow-400">P3 Medium ({p3Count})</span>
                <span className="text-gray-400">{total > 0 ? Math.round((p3Count / total) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-950 overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${total > 0 ? (p3Count / total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-blue-400">P4 Low ({p4Count})</span>
                <span className="text-gray-400">{total > 0 ? Math.round((p4Count / total) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-950 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${total > 0 ? (p4Count / total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* SLA Targets & Thresholds Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="font-bold text-white text-base">Configured SLA Targets & Breach Policy</h3>
          
          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-red-400">P1 Critical SLA</span>
                <p className="text-[11px] text-gray-400">Production system down or core flow blocked</p>
              </div>
              <div className="text-right font-mono font-bold">
                <span className="block text-red-400">TTA: 5 mins</span>
                <span className="text-gray-300 text-[11px]">TTR: 30 mins</span>
              </div>
            </div>

            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-orange-400">P2 High SLA</span>
                <p className="text-[11px] text-gray-400">High latency or partial service degradation</p>
              </div>
              <div className="text-right font-mono font-bold">
                <span className="block text-orange-400">TTA: 15 mins</span>
                <span className="text-gray-300 text-[11px]">TTR: 2 hours</span>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-yellow-400">P3 Medium SLA</span>
                <p className="text-[11px] text-gray-400">Minor feature impact or background pipeline lag</p>
              </div>
              <div className="text-right font-mono font-bold">
                <span className="block text-yellow-400">TTA: 1 hour</span>
                <span className="text-gray-300 text-[11px]">TTR: 8 hours</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SLA Stress Test & Simulation Console */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md mt-6">
        <h3 className="font-bold text-white text-base mb-2 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-cyan-400" />
          <span>SLA Stress Testing & Chaos Simulation Console</span>
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Trigger simulated system anomalies to validate real-time alert dispatch routing, pager escalation, and SLA breach monitors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Traffic Spike Simulator */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">LOAD METRIC EXTREME</span>
              <h4 className="font-bold text-white text-sm mt-1">Simulate Traffic / Query Surge</h4>
              <p className="text-[11px] text-gray-400 mt-1">Injects a simulated database connections spike (998/1000 handles) to trigger active SLA warning alarms.</p>
            </div>
            <button
              onClick={() => handleSimulate('traffic')}
              disabled={isSimulating !== null}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 py-2 text-xs font-bold text-white transition-all mt-3"
            >
              {isSimulating === 'traffic' ? 'Simulating Surge...' : 'Inject Traffic Surge'}
            </button>
          </div>

          {/* Card 2: SLA Breach Timeout Test */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">TTA / TTR TIMEOUT</span>
              <h4 className="font-bold text-white text-sm mt-1">Trigger SLA Breach Simulation</h4>
              <p className="text-[11px] text-gray-400 mt-1">Spawns an active P1 critical incident with a simulated retrofitted timestamp to trigger instant SLA breaches.</p>
            </div>
            <button
              onClick={() => handleSimulate('breach')}
              disabled={isSimulating !== null}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 py-2 text-xs font-bold text-white transition-all mt-3"
            >
              {isSimulating === 'breach' ? 'Triggering Breach...' : 'Simulate SLA Breach'}
            </button>
          </div>

          {/* Card 3: Reset / Clean Slate */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">CLEAN STATE</span>
              <h4 className="font-bold text-white text-sm mt-1">Recover Telemetry Stream</h4>
              <p className="text-[11px] text-gray-400 mt-1">Clears any simulated incidents, updates system metrics, and resets compliance logs back to 100%.</p>
            </div>
            <button
              onClick={() => handleSimulate('reset')}
              disabled={isSimulating !== null}
              className="w-full flex items-center justify-center space-x-2 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 py-2 text-xs font-bold text-gray-300 transition-all mt-3"
            >
              {isSimulating === 'reset' ? 'Recovering...' : 'Reset Telemetry Logs'}
            </button>
          </div>
        </div>

        {simulationLog.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950/60 p-4 font-mono text-[11px] text-gray-300 space-y-1">
            <p className="text-gray-400 font-bold border-b border-gray-900 pb-2 mb-2 uppercase tracking-widest text-[9px]">Simulation Control Logs</p>
            {simulationLog.map((log, i) => (
              <p key={i} className="flex items-center space-x-1.5">
                <span className="text-cyan-500">&gt;&gt;</span>
                <span>{log}</span>
              </p>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
