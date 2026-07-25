'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Video, MessageSquare, ShieldAlert, Bot, User, PhoneCall, ExternalLink, Sparkles } from 'lucide-react';
import { Incident, Responder, WarRoomMessage } from '@/lib/types';
import { useIncidentStore } from '@/lib/store';

interface WarRoomChatProps {
  incident: Incident;
}

const QUICK_OPS_ACTIONS = [
  '⚡ Scaling pod replicas by 2x',
  '🔀 Initiating database failover to secondary node',
  '🛑 Flushing Redis cache keys',
  '📢 Broadcasting status page update to customers',
  '🔍 Analyzing application stack trace logs',
];

export default function WarRoomChat({ incident }: WarRoomChatProps) {
  const { warRoomMessages, addWarRoomMessage } = useIncidentStore();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const messages = warRoomMessages[incident.id] || [];

  // Tab controller state
  const [activeTab, setActiveTab] = useState<'stream' | 'console'>('stream');
  
  // Console state
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleLines, setConsoleLines] = useState<string[]>([
    'Sentinel Diagnostics CLI Shell v2.4 (Active Node: main-node-india)',
    `Session associated with live incident scope: ${incident.id}`,
    'Type "help" for a list of available SRE diagnostic commands.',
    ''
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollConsoleToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'stream') {
      scrollToBottom();
    } else {
      scrollConsoleToBottom();
    }
  }, [messages, consoleLines, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addWarRoomMessage(incident.id, {
      name: incident.assignedTo.name,
      avatar: incident.assignedTo.avatar,
      role: incident.assignedTo.role,
    }, inputText.trim());

    setInputText('');
  };

  const handleQuickOpsAction = (actionText: string) => {
    addWarRoomMessage(incident.id, {
      name: incident.assignedTo.name,
      avatar: incident.assignedTo.avatar,
      role: incident.assignedTo.role,
    }, actionText);
  };

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim();
    const newLines = [...consoleLines, `sre@sentinel-shell:~$ ${cmd}`];
    
    let response: string[] = [];
    const parts = cmd.toLowerCase().split(' ');
    const mainCmd = parts[0];

    if (mainCmd === 'help') {
      response = [
        'Available SRE commands:',
        '  ping          - Ping backend server health metrics',
        '  db-status     - Check database transaction locks and connection counts',
        '  scale-up      - Scale application pods by 2x to handle high traffic loads',
        '  flush-cache   - Evict database cache buffers from Redis cluster',
        '  syslog        - Query system error and warning logs',
        '  clear         - Clear terminal screen history'
      ];
    } else if (mainCmd === 'ping') {
      response = [
        'PING backend-node.protiviti.in (10.14.25.102): 56 data bytes',
        '64 bytes from 10.14.25.102: icmp_seq=0 ttl=64 time=1.25 ms',
        '64 bytes from 10.14.25.102: icmp_seq=1 ttl=64 time=1.12 ms',
        '--- backend-node ping statistics ---',
        '2 packets transmitted, 2 packets received, 0% packet loss'
      ];
    } else if (mainCmd === 'db-status') {
      response = [
        '=== DATABASE METRICS REPORT ===',
        'Connection Pool: 984 / 1000 handles (CRITICAL)',
        'Active Locks: 1 lock detected on table "customer_accounts"',
        'Running Queries: 48 (12 queries in locked/waiting state)',
        'Recommendation: Run "scale-up" or "flush-cache" commands.'
      ];
    } else if (mainCmd === 'scale-up') {
      response = [
        'Scaling deployment/sentinel-gateway replicas by 2x...',
        'Replica count updated: 4 -> 8 (rollout in progress)',
        'Deployment rollout completed successfully.',
        'SLA health status returned to COMPLIANT.'
      ];
      addWarRoomMessage(incident.id, {
        name: 'Sentinel Bot',
        avatar: '/bot-avatar.png',
        role: 'SRE Automator',
      }, `🤖 [Terminal Action] Replicas for deploy/sentinel-gateway scaled up from 4 to 8 successfully.`);
    } else if (mainCmd === 'flush-cache') {
      response = [
        'Flushing Redis cache keys...',
        'OK (482,109 keys evicted successfully in 12ms)'
      ];
      addWarRoomMessage(incident.id, {
        name: 'Sentinel Bot',
        avatar: '/bot-avatar.png',
        role: 'SRE Automator',
      }, `🤖 [Terminal Action] Redis memory buffer cleared successfully.`);
    } else if (mainCmd === 'syslog') {
      response = [
        '[2026-07-25 15:20:04] ERROR Connection pool exhausted on port 5432',
        '[2026-07-25 15:20:10] WARNING Transaction lock wait exceeded for query ID 8945',
        '[2026-07-25 15:20:15] CRITICAL Memory threshold exceeded on secondary node-b'
      ];
    } else if (mainCmd === 'clear') {
      setConsoleLines([]);
      setConsoleInput('');
      return;
    } else {
      response = [
        `bash: command not found: ${cmd}`,
        'Type "help" to see available diagnostic utilities.'
      ];
    }

    setConsoleLines([...newLines, ...response, '']);
    setConsoleInput('');
  };

  return (
    <div className="flex flex-col h-[650px] rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden">
      
      {/* Top War Room Header & Tab Switters */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        
        {/* Title and Join Bridge */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm">War Room & Command Stream</h3>
                <span className="rounded bg-red-500/20 text-red-400 px-2 py-0.5 text-[10px] font-bold border border-red-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-gray-400">Real-time incident response log & responder chat</p>
            </div>
          </div>

          {/* Video Bridge Link */}
          {incident.videoBridgeUrl && (
            <a
              href={incident.videoBridgeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-500/20 transition-all"
            >
              <Video className="h-4 w-4 animate-pulse" />
              <span>Join Video Bridge</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          )}
        </div>

        {/* Tab Selection Row */}
        <div className="flex px-4 py-1.5 space-x-2">
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'stream'
                ? 'bg-red-600/20 border border-red-500/45 text-red-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💬 Discussion Stream
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'console'
                ? 'bg-cyan-600/20 border border-cyan-500/45 text-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🖥️ SRE Diagnostic Console</span>
          </button>
        </div>

      </div>

      {activeTab === 'stream' ? (
        <>
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/60">
            {messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="my-2 flex justify-center">
                    <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
                      <Bot className="h-3.5 w-3.5 text-red-400" />
                      <span className="font-mono">{msg.message}</span>
                    </div>
                  </div>
                );
              }

              const isCommander = msg.sender.name === incident.assignedTo.name;

              return (
                <div key={msg.id} className={`flex items-start space-x-3 ${isCommander ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <img
                    src={msg.sender.avatar}
                    alt={msg.sender.name}
                    className="h-8 w-8 rounded-full border border-gray-700 object-cover mt-0.5"
                  />
                  <div className={`max-w-[75%] rounded-2xl p-3 text-xs ${
                    isCommander
                      ? 'bg-red-600/20 border border-red-500/30 text-gray-100 rounded-tr-none'
                      : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between space-x-3 mb-1 text-[11px]">
                      <span className="font-bold text-gray-200">{msg.sender.name}</span>
                      <span className="text-[10px] text-gray-400">{msg.sender.role}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    <div className="mt-1 text-right text-[9px] text-gray-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Ops Actions Pill Row */}
          <div className="border-t border-gray-800/80 bg-gray-900/40 px-3 py-2 overflow-x-auto">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center whitespace-nowrap">
                <Sparkles className="h-3 w-3 text-amber-400 mr-1" /> Quick Ops:
              </span>
              {QUICK_OPS_ACTIONS.map((act, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickOpsAction(act)}
                  className="whitespace-nowrap rounded-md border border-gray-800 bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-gray-300 hover:border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 border-t border-gray-800 bg-gray-900 p-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type update or command note for incident war room..."
              className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex items-center space-x-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors shadow-md shadow-red-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </>
      ) : (
        <>
          {/* Terminal Console View */}
          <div className="flex-1 overflow-y-auto p-4 bg-black font-mono text-[11px] text-cyan-400 space-y-1.5 scrollbar-thin">
            {consoleLines.map((line, idx) => (
              <div key={idx} className="whitespace-pre-line leading-relaxed min-h-[14px]">
                {line}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          {/* Console Command Shortcuts */}
          <div className="border-t border-gray-900 bg-gray-950 px-3 py-2 overflow-x-auto">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center whitespace-nowrap">
                🐚 Shortcuts:
              </span>
              {['help', 'ping', 'db-status', 'scale-up', 'flush-cache', 'syslog'].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => setConsoleInput(cmd)}
                  className="whitespace-nowrap rounded border border-gray-850 bg-gray-900 px-2 py-0.5 text-[10px] text-cyan-300 hover:border-cyan-500/40 hover:bg-gray-850 transition-all font-mono"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Command Input Form */}
          <form onSubmit={handleConsoleSubmit} className="flex items-center space-x-2 border-t border-gray-900 bg-black p-3 font-mono">
            <span className="text-cyan-400 text-xs shrink-0 select-none">sre@sentinel-shell:~$</span>
            <input
              type="text"
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              placeholder="Type diagnostic command (e.g. 'help', 'ping')..."
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-700 focus:outline-none font-mono"
              autoFocus
            />
            <button
              type="submit"
              disabled={!consoleInput.trim()}
              className="rounded-lg bg-cyan-950 border border-cyan-850 hover:bg-cyan-900 text-cyan-300 px-3.5 py-1.5 text-xs font-bold transition-all shadow-md"
            >
              Run
            </button>
          </form>
        </>
      )}
    </div>
  );
}
