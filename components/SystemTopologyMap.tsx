'use client';

import React, { useState, useEffect } from 'react';
import { useIncidentStore } from '@/lib/store';
import { Activity, ShieldAlert, CheckCircle2, Server, Cpu, Clock, RefreshCw, Zap } from 'lucide-react';
import AlertDispatcherModal from './AlertDispatcherModal';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  ip: string;
  matchingServices: string[];
  matchingTags: string[];
}

const NODES: Node[] = [
  { id: 'frontend', name: 'Web Frontend', x: 80, y: 150, ip: '10.0.1.12', matchingServices: ['Frontend Portal'], matchingTags: ['frontend'] },
  { id: 'gateway', name: 'API Gateway', x: 240, y: 150, ip: '10.0.1.25', matchingServices: ['API Gateway'], matchingTags: ['gateway', 'proxy'] },
  { id: 'auth', name: 'Auth Service', x: 400, y: 65, ip: '10.0.2.14', matchingServices: ['Active Directory', 'Auth Service'], matchingTags: ['auth', 'identity'] },
  { id: 'payment', name: 'Payment Processor', x: 400, y: 235, ip: '192.168.1.9', matchingServices: ['Payment Processor'], matchingTags: ['payment'] },
  { id: 'database', name: 'Database Cluster', x: 560, y: 150, ip: '10.0.4.40', matchingServices: ['Platform & DB'], matchingTags: ['database', 'db', 'postgres'] },
  { id: 'cache', name: 'Redis Cache Store', x: 720, y: 150, ip: '10.0.4.41', matchingServices: ['Cache Store'], matchingTags: ['redis', 'cache'] }
];

const CONNECTIONS = [
  { from: 'frontend', to: 'gateway' },
  { from: 'gateway', to: 'auth' },
  { from: 'gateway', to: 'payment' },
  { from: 'gateway', to: 'database' },
  { from: 'auth', to: 'database' },
  { from: 'payment', to: 'database' },
  { from: 'database', to: 'cache' }
];

export default function SystemTopologyMap() {
  const { incidents } = useIncidentStore();
  const [selectedNode, setSelectedNode] = useState<Node>(NODES[1]);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Real-time telemetry simulation
  const [latencyHistory, setLatencyHistory] = useState<number[]>([24, 28, 22, 29, 32, 25, 27, 30, 24, 28, 29, 23]);
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 15, 18, 14, 20, 16, 17, 19, 13, 15, 16, 14]);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  // Check if a specific node is healthy or has an active incident
  const getNodeStatus = (node: Node) => {
    const hasOutage = activeIncidents.some(inc => 
      node.matchingServices.includes(inc.service) || 
      inc.tags.some(tag => node.matchingTags.includes(tag.toLowerCase()))
    );
    return hasOutage ? 'outage' : 'healthy';
  };

  const getIncidentsForNode = (node: Node) => {
    return activeIncidents.filter(inc => 
      node.matchingServices.includes(inc.service) || 
      inc.tags.some(tag => node.matchingTags.includes(tag.toLowerCase()))
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const isOutage = getNodeStatus(selectedNode) === 'outage';
      
      // Update Latency
      setLatencyHistory(prev => {
        let nextVal = isOutage 
          ? Math.floor(800 + Math.random() * 500) // Huge latency in outage
          : Math.floor(15 + Math.random() * 20); // Low latency normal
        return [...prev.slice(1), nextVal];
      });

      // Update CPU
      setCpuHistory(prev => {
        let nextVal = isOutage 
          ? Math.floor(85 + Math.random() * 15) // High CPU load
          : Math.floor(8 + Math.random() * 15); // Normal CPU load
        return [...prev.slice(1), nextVal];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedNode, incidents]);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-300">
            🖥️ System Topology & Infrastructure Telemetry
          </h2>
        </div>
        <div className="flex items-center space-x-4 text-[10px] tracking-wider uppercase font-bold text-gray-500">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Healthy</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Outage</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* SVG Network Map Column */}
        <div className="xl:col-span-3 bg-gray-950/70 border border-gray-800/80 rounded-2xl p-4 flex items-center justify-center min-h-[300px] overflow-x-auto relative">
          <svg className="w-full max-w-[800px] h-[300px]" viewBox="0 0 800 300">
            <defs>
              <linearGradient id="healthyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="outageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <filter id="glowHealthy">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glowOutage">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Render Connection Lines */}
            {CONNECTIONS.map((conn, idx) => {
              const fromNode = NODES.find(n => n.id === conn.from)!;
              const toNode = NODES.find(n => n.id === conn.to)!;
              const isFromOutage = getNodeStatus(fromNode) === 'outage';
              const isToOutage = getNodeStatus(toNode) === 'outage';
              const hasAnomaly = isFromOutage || isToOutage;

              return (
                <g key={idx}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    className={`stroke-2 ${hasAnomaly ? 'stroke-red-500/50' : 'stroke-cyan-500/20'}`}
                  />
                  {/* Flow pulses */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={hasAnomaly ? '#ef4444' : '#06b6d4'}
                    strokeWidth={1.5}
                    strokeDasharray="8 20"
                    className="animate-flow-dash"
                  />
                </g>
              );
            })}

            {/* Render Node Circles */}
            {NODES.map((node) => {
              const status = getNodeStatus(node);
              const isSelected = selectedNode.id === node.id;
              
              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Selected ring */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={32}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Outer status ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={status === 'outage' ? 24 : 20}
                    fill={status === 'outage' ? 'url(#outageGradient)' : 'url(#healthyGradient)'}
                    filter={status === 'outage' ? 'url(#glowOutage)' : 'url(#glowHealthy)'}
                    className={`${status === 'outage' ? 'animate-pulse' : 'hover:scale-105 transition-all'}`}
                  />

                  {/* Inner ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={status === 'outage' ? 20 : 16}
                    fill="#030712"
                    stroke={status === 'outage' ? '#fca5a5' : '#a7f3d0'}
                    strokeWidth={0.5}
                  />

                  {/* Text Icon Representation */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={status === 'outage' ? '#f87171' : '#34d399'}
                    className="font-mono text-[10px] font-bold select-none pointer-events-none"
                  >
                    {node.id.toUpperCase().slice(0, 3)}
                  </text>

                  {/* Tooltip Label */}
                  <text
                    x={node.x}
                    y={node.y + 36}
                    textAnchor="middle"
                    fill={isSelected ? '#e0f2fe' : '#9ca3af'}
                    className="font-sans text-[10px] font-bold select-none pointer-events-none tracking-wide"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Telemetry Inspection Panel Column */}
        <div className="xl:col-span-1 border border-gray-800 bg-gray-950/90 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Selected Node</span>
              <span className="text-[10px] font-mono text-gray-400">{selectedNode.ip}</span>
            </div>

            <h3 className="text-sm font-black text-white">{selectedNode.name}</h3>
            
            {/* Status Flag */}
            <div className="mt-2.5 flex items-center space-x-1.5">
              {getNodeStatus(selectedNode) === 'outage' ? (
                <span className="inline-flex items-center space-x-1 rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[9px] font-bold text-red-400 animate-pulse">
                  <ShieldAlert className="h-3 w-3" />
                  <span>CRITICAL OUTAGE</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>SYSTEM HEALTHY</span>
                </span>
              )}
            </div>

            {/* Sparkline stats */}
            <div className="mt-5 space-y-4">
              
              {/* Latency Sparkline */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>LATENCY</span>
                  <span className="font-bold text-cyan-400 font-mono">
                    {latencyHistory[latencyHistory.length - 1]} ms
                  </span>
                </div>
                <svg className="w-full h-8 bg-gray-950 border border-gray-800/60 rounded" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path
                    d={`M ${latencyHistory.map((val, i) => {
                      const maxVal = Math.max(...latencyHistory) || 1;
                      const x = (i / (latencyHistory.length - 1)) * 100;
                      const y = 20 - (val / maxVal) * 16;
                      return `${x} ${y}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                  />
                </svg>
              </div>

              {/* CPU Sparkline */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>CPU UTILIZATION</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {cpuHistory[cpuHistory.length - 1]}%
                  </span>
                </div>
                <svg className="w-full h-8 bg-gray-950 border border-gray-800/60 rounded" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path
                    d={`M ${cpuHistory.map((val, i) => {
                      const maxVal = Math.max(...cpuHistory) || 1;
                      const x = (i / (cpuHistory.length - 1)) * 100;
                      const y = 20 - (val / maxVal) * 16;
                      return `${x} ${y}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={1.5}
                  />
                </svg>
              </div>

            </div>

            {/* Active alerts for node */}
            <div className="mt-5 border-t border-gray-800/80 pt-3">
              <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Active Node Outages ({getIncidentsForNode(selectedNode).length})
              </span>
              {getIncidentsForNode(selectedNode).length === 0 ? (
                <p className="text-[10px] text-gray-500 italic">No warnings active on node.</p>
              ) : (
                <div className="space-y-1.5 max-h-20 overflow-y-auto">
                  {getIncidentsForNode(selectedNode).map((inc) => (
                    <Link
                      key={inc.id}
                      href={`/incidents/${inc.id}`}
                      className="block text-[10px] text-red-300 bg-red-950/20 border border-red-500/20 p-1.5 rounded hover:bg-red-950/30 transition-all font-semibold"
                    >
                      {inc.id}: {inc.title.slice(0, 20)}...
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/60 flex space-x-2">
            <button
              onClick={() => setIsSimModalOpen(true)}
              className="flex-1 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center justify-center space-x-1"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>⚡ Inject Fault</span>
            </button>
          </div>
        </div>

      </div>

      {isSimModalOpen && (
        <AlertDispatcherModal onClose={() => setIsSimModalOpen(false)} />
      )}
    </div>
  );
}
