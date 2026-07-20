'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, AlertOctagon, Clock, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import IncidentOccurrenceFormModal from '@/components/IncidentOccurrenceFormModal';

export default function RcaListPage() {
  const { isLoaded, rcaReports, incidents } = useIncidentStore();
  const [selectedIncidentForForm, setSelectedIncidentForForm] = useState<any>(null);

  if (!isLoaded) return null;

  // Find resolved incidents that lack an RCA
  const pendingRcaIncidents = incidents.filter(
    i => (i.severity === 'P1' || i.severity === 'P2') && i.status === 'resolved' && !i.rcaId
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Root Cause Analysis & Post-Mortem Studio</h1>
          <p className="mt-1 text-xs text-gray-400">
            Mandatory post-incident reports, 5 Whys analysis, and engineering action items
          </p>
        </div>
      </div>

      {/* Pending RCA Alert Banner (if any) */}
      {pendingRcaIncidents.length > 0 && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertOctagon className="h-6 w-6 text-amber-400 animate-bounce" />
              <div>
                <h3 className="font-bold text-amber-200 text-sm">
                  {pendingRcaIncidents.length} Pending Post-Mortem Report{pendingRcaIncidents.length > 1 ? 's' : ''} Required
                </h3>
                <p className="text-xs text-amber-300/80">
                  Critical & High severity incidents resolved without an official RCA report on file.
                </p>
              </div>
            </div>
            <Link
              href={`/incidents/${pendingRcaIncidents[0].id}`}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-gray-950 hover:bg-amber-400 shadow-md shadow-amber-500/20"
            >
              Author RCA Now →
            </Link>
          </div>
        </div>
      )}

      {/* RCA Directory List */}
      <div className="space-y-4">
        <h2 className="font-bold text-white text-base">Completed Post-Mortems ({rcaReports.length})</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rcaReports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    report.severity === 'P1' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {report.severity}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-400">{report.id}</span>
                </div>
                <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>REVIEWED</span>
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-white text-sm">{report.title}</h3>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{report.summary}</p>
              </div>

              {/* Impact stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-gray-800 bg-gray-950/60 p-2.5 text-[11px]">
                <div>
                  <span className="block text-gray-500 text-[9px]">DOWNTIME</span>
                  <span className="font-bold text-gray-200">{report.impact.durationMinutes} mins</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[9px]">USERS AFFECTED</span>
                  <span className="font-bold text-gray-200">{report.impact.usersAffected}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[9px]">ACTION ITEMS</span>
                  <span className="font-bold text-gray-200">{report.actionItems.length} Tasks</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-800/60 text-xs">
                <button
                  onClick={() => setSelectedIncidentForForm(incidents.find(i => i.id === report.incidentId) || { id: report.incidentId })}
                  className="flex items-center space-x-1 font-semibold text-cyan-400 hover:underline"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Compliance IOF Form</span>
                </button>
                <Link
                  href={`/incidents/${report.incidentId}`}
                  className="flex items-center space-x-1 font-semibold text-red-400 hover:underline"
                >
                  <span>View Post-Mortem</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIncidentForForm && (
        <IncidentOccurrenceFormModal 
          incident={selectedIncidentForForm} 
          onClose={() => setSelectedIncidentForForm(null)} 
        />
      )}

    </div>
  );
}
