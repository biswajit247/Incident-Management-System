'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  BellRing, 
  Zap, 
  Layers,
  Plus,
  X,
  Calendar
} from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import { OnCallShift } from '@/lib/types';
import { MOCK_RESPONDERS } from '@/lib/mockData';

export default function OnCallScheduleView() {
  const { shifts, notifications, createOnCallShift } = useIncidentStore();
  const [selectedShift, setSelectedShift] = useState<OnCallShift>(shifts[0] || shifts[0]);
  const [testPagedMsg, setTestPagedMsg] = useState<string | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [service, setService] = useState('Platform & DB');
  const [escalationTimeout, setEscalationTimeout] = useState(15);
  const [tier1Id, setTier1Id] = useState(MOCK_RESPONDERS[0]?.id || '');
  const [tier2Id, setTier2Id] = useState(MOCK_RESPONDERS[1]?.id || '');
  const [execId, setExecId] = useState(MOCK_RESPONDERS[2]?.id || '');
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');

  const handleTestPager = (recipientName: string) => {
    setTestPagedMsg(`Twilio dispatch successful: SMS & Voice Pager alert sent to ${recipientName}`);
    setTimeout(() => setTestPagedMsg(null), 4000);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const t1 = MOCK_RESPONDERS.find(r => r.id === tier1Id) || MOCK_RESPONDERS[0];
    const t2 = MOCK_RESPONDERS.find(r => r.id === tier2Id) || MOCK_RESPONDERS[1];
    const exec = MOCK_RESPONDERS.find(r => r.id === execId) || MOCK_RESPONDERS[2];

    const newShift: OnCallShift = {
      id: `shift-${Date.now()}`,
      organizationId: 'org-protiviti-in',
      teamName,
      service,
      escalationTimeoutMins: Number(escalationTimeout),
      tier1: t1,
      tier2: t2,
      executiveEscalation: exec,
      shiftStart,
      shiftEnd
    };

    createOnCallShift(newShift);
    setSelectedShift(newShift);
    
    // reset form
    setTeamName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 text-xs font-bold border border-cyan-500/30">
                ACTIVE ROTATIONS
              </span>
              <h2 className="text-xl font-bold text-white">On-Call Rotations & Escalation Policies</h2>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Automated multi-tier alert routing with SMS, Voice Call, and Push escalation rules
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {testPagedMsg && (
              <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 animate-pulse">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{testPagedMsg}</span>
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create On-Call Rotation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {shifts.map((shift) => (
          <div 
            key={shift.id}
            className={`rounded-2xl border p-5 transition-all ${
              selectedShift.id === shift.id
                ? 'border-cyan-500/50 bg-gray-900/90 shadow-xl shadow-cyan-500/5'
                : 'border-gray-800/80 bg-gray-900/40 hover:border-gray-700'
            }`}
            onClick={() => setSelectedShift(shift)}
          >
            {/* Shift Title */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Service Shift</span>
                <h3 className="font-bold text-white text-base">{shift.teamName}</h3>
              </div>
              <span className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-[11px] font-mono font-medium text-cyan-300">
                {shift.service}
              </span>
            </div>

            {/* Rotation Members */}
            <div className="mt-4 space-y-3">
              
              {/* Tier 1 Primary */}
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    Tier 1 • Primary On-Call
                  </span>
                  <span className="text-[10px] text-gray-400">0 - {shift.escalationTimeoutMins}m</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src={shift.tier1.avatar} 
                      alt={shift.tier1.name} 
                      className="h-8 w-8 rounded-full border border-red-500/40 object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-100 text-xs">{shift.tier1.name}</p>
                      <p className="text-[10px] text-gray-400">{shift.tier1.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTestPager(shift.tier1.name); }}
                    className="flex items-center space-x-1 rounded-lg border border-red-500/40 bg-red-500/20 px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-500/30"
                  >
                    <BellRing className="h-3 w-3" />
                    <span>Send Page Alert</span>
                  </button>
                </div>
              </div>

              {/* Tier 2 Secondary */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Tier 2 • Secondary Backup
                  </span>
                  <span className="text-[10px] text-gray-400">{shift.escalationTimeoutMins}m+</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src={shift.tier2.avatar} 
                      alt={shift.tier2.name} 
                      className="h-8 w-8 rounded-full border border-amber-500/40 object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-100 text-xs">{shift.tier2.name}</p>
                      <p className="text-[10px] text-gray-400">{shift.tier2.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTestPager(shift.tier2.name); }}
                    className="flex items-center space-x-1 rounded-lg border border-amber-500/40 bg-amber-500/20 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30"
                  >
                    <BellRing className="h-3 w-3" />
                    <span>Send Page Alert</span>
                  </button>
                </div>
              </div>

              {/* Executive Escalation */}
              <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Executive Escalation Lead
                  </span>
                  <span className="text-[10px] text-gray-500">15m+</span>
                </div>
                <div className="mt-2 flex items-center space-x-2.5">
                  <img 
                    src={shift.executiveEscalation.avatar} 
                    alt={shift.executiveEscalation.name} 
                    className="h-8 w-8 rounded-full border border-gray-700 object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-200 text-xs">{shift.executiveEscalation.name}</p>
                    <p className="text-[10px] text-gray-400">{shift.executiveEscalation.role}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Shift Duration */}
            <div className="mt-4 border-t border-gray-800/60 pt-3 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>Shift: {shift.shiftStart} - {shift.shiftEnd}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Workflow Step Diagram */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
        <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span>Automated Escalation Rule Engine</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <span className="text-[10px] font-bold text-red-400 uppercase">Step 1 • 0 Mins</span>
            <h4 className="font-bold text-white text-sm mt-1">Datadog / Prometheus Alert</h4>
            <p className="text-xs text-gray-300 mt-1">Alert triggers incident. Auto-sends SMS & Push notification to Tier 1 Primary Responder.</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Step 2 • 5 Mins</span>
            <h4 className="font-bold text-white text-sm mt-1">Unacknowledged Escalation</h4>
            <p className="text-xs text-gray-300 mt-1">If unacknowledged after 5m, system initiates Twilio Voice Call & pages Tier 2 Backup.</p>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <span className="text-[10px] font-bold text-purple-400 uppercase">Step 3 • 15 Mins</span>
            <h4 className="font-bold text-white text-sm mt-1">War Room Provisioning</h4>
            <p className="text-xs text-gray-300 mt-1">Auto-provisions Video Bridge, Slack incident channel, and alerts Executive Lead.</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 4 • Post-Resolution</span>
            <h4 className="font-bold text-white text-sm mt-1">RCA Enforcement</h4>
            <p className="text-xs text-gray-300 mt-1">Locks Incident post-resolution until mandatory Root Cause Analysis report is generated.</p>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-2 font-bold text-white text-base border-b border-gray-800 pb-3 mb-4">
              <Calendar className="h-5 w-5 text-cyan-400" />
              <span>Create On-Call Rotation Shift</span>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400">Rotation Team Name</label>
                <input 
                  type="text" 
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Kolkata NOC Command, SecOps Shift A"
                  required
                  className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Monitored Service</label>
                  <select
                    value={service}
                    onChange={e => setService(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Platform & DB">Platform & DB</option>
                    <option value="Security & Auth">Security & Auth</option>
                    <option value="SRE Core">SRE Core</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Escalation Timeout (mins)</label>
                  <input 
                    type="number"
                    value={escalationTimeout}
                    onChange={e => setEscalationTimeout(Number(e.target.value))}
                    min="1"
                    max="60"
                    required
                    className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Tier 1 Primary</label>
                  <select
                    value={tier1Id}
                    onChange={e => setTier1Id(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-2..5 py-2 text-[11px] text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {MOCK_RESPONDERS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Tier 2 Backup</label>
                  <select
                    value={tier2Id}
                    onChange={e => setTier2Id(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-2.5 py-2 text-[11px] text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {MOCK_RESPONDERS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Executive Escalation</label>
                  <select
                    value={execId}
                    onChange={e => setExecId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-2.5 py-2 text-[11px] text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {MOCK_RESPONDERS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Shift Start Time</label>
                  <input 
                    type="text" 
                    value={shiftStart}
                    onChange={e => setShiftStart(e.target.value)}
                    placeholder="09:00"
                    required
                    className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">Shift End Time</label>
                  <input 
                    type="text" 
                    value={shiftEnd}
                    onChange={e => setShiftEnd(e.target.value)}
                    placeholder="17:00"
                    required
                    className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20"
                >
                  Create Rotation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
