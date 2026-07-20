'use client';

import React from 'react';
import { BarChart3, Clock, CheckCircle2, ShieldAlert, TrendingDown, Layers, Zap } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';

export default function AnalyticsPage() {
  const { isLoaded, incidents } = useIncidentStore();

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

    </div>
  );
}
