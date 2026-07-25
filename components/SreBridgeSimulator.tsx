'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, ScreenShare, Users, Plus, PhoneOff, ShieldAlert, CheckCircle2, Terminal } from 'lucide-react';
import { Incident } from '@/lib/types';
import { MOCK_RESPONDERS } from '@/lib/mockData';

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
}

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Biswajit Naskar', role: 'Incident Commander', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', isMuted: false, isSpeaking: false },
  { id: '2', name: 'Rohan Mehta', role: 'Database Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', isMuted: false, isSpeaking: false },
  { id: '3', name: 'Priya Sharma', role: 'Infrastructure Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', isMuted: true, isSpeaking: false }
];

const TRANSCRIPTS = [
  { speaker: 'Biswajit Naskar', text: 'Welcome to the triage bridge. Outage telemetry confirmed on gateway. Priya, checking routing?' },
  { speaker: 'Priya Sharma', text: 'Gateway healthchecks returning 503 Service Unavailable. DB query queue is backing up.' },
  { speaker: 'Rohan Mehta', text: 'Investigating lock tables in Postgres. We have a connection leak on analytics logs queries.' },
  { speaker: 'Biswajit Naskar', text: 'Rohan, can we terminate lock session PIDs concurrently?' },
  { speaker: 'Rohan Mehta', text: 'Terminating locking PID 9402 now. Pool connections starting to clear.' },
  { speaker: 'Priya Sharma', text: 'DB write latency dropping back under 12ms. Gateway routing is stabilizing.' },
  { speaker: 'Biswajit Naskar', text: 'Confirming recovery. Let\'s keep monitoring pool health and schedule the post-mortem.' }
];

export default function SreBridgeSimulator({ incident }: { incident: Incident }) {
  const [joined, setJoined] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [callLogs, setCallLogs] = useState<{ time: string; speaker: string; text: string }[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  
  const logIndexRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!joined) {
      setActiveSpeaker(null);
      return;
    }

    const interval = setInterval(() => {
      if (logIndexRef.current >= TRANSCRIPTS.length) {
        logIndexRef.current = 0; // Loop conversation
        setCallLogs([]);
      }

      const log = TRANSCRIPTS[logIndexRef.current];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setCallLogs(prev => [...prev, { time: timestamp, speaker: log.speaker, text: log.text }]);
      setActiveSpeaker(log.speaker);

      // Update speaker animations
      setParticipants(prev => prev.map(p => ({
        ...p,
        isSpeaking: p.name === log.speaker && !p.isMuted
      })));

      logIndexRef.current += 1;
    }, 4500);

    return () => clearInterval(interval);
  }, [joined]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [callLogs]);

  const handleInvite = (id: string) => {
    const invitee = MOCK_RESPONDERS.find(r => r.id === id);
    if (!invitee || participants.some(p => p.name === invitee.name)) return;

    const newPart: Participant = {
      id: invitee.id,
      name: invitee.name,
      role: invitee.role,
      avatar: invitee.avatar,
      isMuted: false,
      isSpeaking: false
    };

    setParticipants(prev => [...prev, newPart]);
    
    // Log join message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCallLogs(prev => [...prev, { time: timestamp, speaker: 'System', text: `📞 ${invitee.name} (${invitee.role}) has joined the SRE Bridge.` }]);
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <Video className="h-5 w-5 text-red-500 animate-pulse" />
          <h3 className="font-bold text-white text-base">SRE Live Incident Sync Bridge</h3>
        </div>
        <span className="rounded bg-red-950/80 border border-red-800/60 px-2 py-0.5 text-[10px] font-bold text-red-400">
          SECURE BRIDGE CON-409
        </span>
      </div>

      {!joined ? (
        /* Pre-join screen */
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Video className="h-8 w-8 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Active Triage Bridge is Open</h4>
            <p className="text-xs text-gray-400 mt-1">
              On-Call responders are currently analyzing diagnostics for Incident {incident.id}.
            </p>
          </div>
          <button
            onClick={() => setJoined(true)}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20"
          >
            Join SRE Voice Bridge
          </button>
        </div>
      ) : (
        /* Call screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Participants Video/Audio feed list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Local User */}
              <div className="relative rounded-xl border border-gray-800 bg-gray-950 overflow-hidden min-h-[140px] flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400">
                    YOU (IC ASSIST)
                  </span>
                  <div className="flex space-x-1">
                    {micMuted ? (
                      <span className="rounded-full bg-red-500/20 p-1 text-red-400 border border-red-500/30">
                        <MicOff className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 p-1 text-emerald-400 border border-emerald-500/30">
                        <Mic className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-4">
                  <div className="h-10 w-10 rounded-full bg-cyan-600/20 border border-cyan-500 flex items-center justify-center font-bold text-cyan-400 text-sm">
                    YO
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Operator Console</h5>
                    <p className="text-[10px] text-gray-500">SecOps Control Room</p>
                  </div>
                </div>

                {/* Animated waveform if talking */}
                {!micMuted && (
                  <div className="absolute bottom-2 right-4 flex items-end space-x-0.5 h-6">
                    <span className="w-1 bg-cyan-400 rounded animate-voice-bar-1 h-3"></span>
                    <span className="w-1 bg-cyan-400 rounded animate-voice-bar-2 h-5"></span>
                    <span className="w-1 bg-cyan-400 rounded animate-voice-bar-3 h-4"></span>
                  </div>
                )}
              </div>

              {/* Other Active Call Members */}
              {participants.map((part) => (
                <div key={part.id} className={`relative rounded-xl border overflow-hidden min-h-[140px] flex flex-col justify-between p-4 transition-all ${
                  part.isSpeaking ? 'border-red-500 bg-red-950/10' : 'border-gray-800 bg-gray-950'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[9px] font-bold text-gray-400">
                      {part.role}
                    </span>
                    <div className="flex space-x-1">
                      {part.isMuted ? (
                        <span className="rounded-full bg-red-500/20 p-1 text-red-400 border border-red-500/30">
                          <MicOff className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/20 p-1 text-emerald-400 border border-emerald-500/30">
                          <Mic className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-4">
                    <img src={part.avatar} alt={part.name} className="h-10 w-10 rounded-full border border-gray-700 object-cover" />
                    <div>
                      <h5 className="font-bold text-white text-xs">{part.name}</h5>
                      <p className="text-[10px] text-gray-500">{part.role}</p>
                    </div>
                  </div>

                  {/* Animated speaking waveform */}
                  {part.isSpeaking && (
                    <div className="absolute bottom-2 right-4 flex items-end space-x-0.5 h-6">
                      <span className="w-1 bg-red-400 rounded animate-voice-bar-1 h-4"></span>
                      <span className="w-1 bg-red-400 rounded animate-voice-bar-2 h-6"></span>
                      <span className="w-1 bg-red-400 rounded animate-voice-bar-3 h-3"></span>
                    </div>
                  )}
                </div>
              ))}

            </div>

            {/* Simulated Shared Screen Console */}
            {sharingScreen && (
              <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono">SCREEN_SHARE: Rohan Mehta (DB Console)</span>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400 space-y-1 overflow-x-auto">
                  <p>$ pg_stat_activity | grep "locks"</p>
                  <p className="text-gray-400">pid: 9402 | query: SELECT * FROM user_records FOR UPDATE; | state: idle in transaction</p>
                  <p>$ SELECT pg_terminate_backend(9402);</p>
                  <p className="text-cyan-400">pg_terminate_backend: true</p>
                  <p>$ pg_stat_activity | grep "locks" | wc -l</p>
                  <p className="text-emerald-300">0 locks active.</p>
                </div>
              </div>
            )}

            {/* Triage controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMicMuted(!micMuted)}
                  className={`p-2.5 rounded-lg border transition-all ${
                    micMuted ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-gray-800 bg-gray-900 text-gray-300 hover:text-white'
                  }`}
                  title="Toggle Microphone"
                >
                  {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setSharingScreen(!sharingScreen)}
                  className={`p-2.5 rounded-lg border transition-all ${
                    sharingScreen ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-gray-800 bg-gray-900 text-gray-300 hover:text-white'
                  }`}
                  title="Toggle Screen Share"
                >
                  <ScreenShare className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setJoined(false)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20"
              >
                <PhoneOff className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>

          </div>

          {/* SRE Dialogue Transcript Column */}
          <div className="lg:col-span-1 border border-gray-800 bg-gray-950 rounded-xl p-4 flex flex-col justify-between h-[340px] lg:h-auto">
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dialogue Transcript</span>
                <span className="text-[9px] font-mono text-gray-400">Live Feed</span>
              </div>

              {/* Scrolling logs */}
              <div className="space-y-3 overflow-y-auto max-h-[220px] lg:max-h-[280px] pr-2">
                {callLogs.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic">Tuning into audio stream. Dialogue will appear as SREs speak...</p>
                ) : (
                  callLogs.map((log, i) => (
                    <div key={i} className="text-[11px] leading-relaxed border-l border-gray-800 pl-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-0.5">
                        <span className={`font-bold ${log.speaker === 'System' ? 'text-cyan-400' : 'text-gray-300'}`}>{log.speaker}</span>
                        <span className="font-mono text-[9px]">{log.time}</span>
                      </div>
                      <p className={`${log.speaker === 'System' ? 'text-cyan-300' : 'text-gray-400'}`}>{log.text}</p>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Invite sidebar */}
            <div className="border-t border-gray-800/80 pt-3 mt-3">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Invite On-Call Responder
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleInvite(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full rounded bg-gray-900 border border-gray-800 px-2 py-1.5 text-[10px] text-white focus:outline-none"
              >
                <option value="">-- Page Engineer --</option>
                {MOCK_RESPONDERS.filter(r => !participants.some(p => p.name === r.name)).map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.role})
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
