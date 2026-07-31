'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  Square, 
  Terminal, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  AlertOctagon, 
  Flame, 
  Gauge
} from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import { Severity } from '@/lib/types';
import AuthModal from '@/components/AuthModal';

interface ChaosExperiment {
  id: string;
  name: string;
  category: string;
  targetService: string;
  severity: Severity;
  description: string;
  telemetryMetric: string;
  normalState: string;
  chaosState: string;
  logs: string[];
}

const EXPERIMENTS: ChaosExperiment[] = [
  {
    id: 'db-cpu',
    name: 'DB Node CPU Exhaustion Stress',
    category: 'Database Cluster',
    targetService: 'Platform & DB',
    severity: 'P1',
    description: 'Deploys a stress-ng container to consume 98% CPU resources on the Postgres primary replica node (10.0.4.40).',
    telemetryMetric: 'CPU Utilization',
    normalState: '12%',
    chaosState: '98%',
    logs: [
      '[CHAOS] Spawning stress-ng replica pod on node 10.0.4.40...',
      '[CHAOS] Stress parameters: --cpu 16 --cpu-load 95 --timeout 60s',
      '[SYS] System CPU utilization rising: 12% ➔ 45% ➔ 80% ➔ 98%',
      '[WARN] Database query latency spiked to 850ms (SLA Limit: 50ms)',
      '[TELEMETRY] Prometheus rule "pg_cpu_utilization_critical" breached!',
      '[WEBHOOK] Dispatched P1 alert payload to Sentinel Command Center.'
    ]
  },
  {
    id: 'az-blackhole',
    name: 'Availability Zone Network Blackhole',
    category: 'Network Routing',
    targetService: 'API Gateway',
    severity: 'P1',
    description: 'Simulates a complete network drop or AZ isolation in us-east-1a, creating packet loss on the API routing tables.',
    telemetryMetric: 'Packet Loss',
    normalState: '0.01%',
    chaosState: '100%',
    logs: [
      '[CHAOS] Purging BGP routing pathways for subnetwork us-east-1a...',
      '[CHAOS] Injecting blackhole route rules on virtual routing tables...',
      '[WARN] HTTP packet loss reached 100% on frontend gateway endpoints.',
      '[TELEMETRY] health_check_routing_gateway returning 503 Service Unavailable.',
      '[WEBHOOK] Dispatched P1 alert payload to Sentinel Command Center.'
    ]
  },
  {
    id: 'redis-eviction',
    name: 'Redis Cache Session Memory Saturation',
    category: 'Cache Memory',
    targetService: 'Cache Store',
    severity: 'P2',
    description: 'Fills Redis memory allocations to trigger maximum policy cache evictions, causing OAuth session terminations.',
    telemetryMetric: 'Cache Evictions',
    normalState: '0 keys/s',
    chaosState: '4,500 keys/s',
    logs: [
      '[CHAOS] Saturating Redis cache store memory buffers...',
      '[SYS] Maxmemory policy "volatile-lru" triggered.',
      '[WARN] Eviction rate spiked: 4,500 active session keys terminated per second.',
      '[TELEMETRY] Auth validation microservice reports 30% login error spike.',
      '[WEBHOOK] Dispatched P2 alert payload to Sentinel Command Center.'
    ]
  },
  {
    id: 'gateway-ddos',
    name: 'API Gateway HTTP Flooder DDoS',
    category: 'Traffic Load',
    targetService: 'API Gateway',
    severity: 'P3',
    description: 'Simulates a DDoS burst traffic load (15,000 requests/sec) to stress the API Gateway ingress controller rate limits.',
    telemetryMetric: 'Error Rate',
    normalState: '0.04%',
    chaosState: '42%',
    logs: [
      '[CHAOS] Executing simulated locust traffic generator load...',
      '[SYS] Ingress requests spiking: 800 req/s ➔ 15,000 req/s',
      '[WARN] Rate limiter dropping packets. API response returning 429 Too Many Requests.',
      '[TELEMETRY] Gateway ingress error rates reached 42%.',
      '[WEBHOOK] Dispatched P3 alert payload to Sentinel Command Center.'
    ]
  },
  {
    id: 'facilities-thermal',
    name: 'Server Room Thermal Overheat Warning',
    category: 'Facilities Control',
    targetService: 'Platform & DB',
    severity: 'P1',
    description: 'Simulates a dual AC unit compressor trip in the Kolkata 10th Floor server room, raising environment temperatures.',
    telemetryMetric: 'Environment Temp',
    normalState: '21°C',
    chaosState: '43°C',
    logs: [
      '[CHAOS] Simulating thermal sensor reporting override...',
      '[SYS] Environment ambient temperature rising: 21°C ➔ 32°C ➔ 43°C',
      '[WARN] Kolkata server room backup fans engaged. Temperature remains critical.',
      '[TELEMETRY] Kolkata Facilities HVAC critical alert rule triggered.',
      '[WEBHOOK] Dispatched P1 alert payload to Sentinel Command Center.'
    ]
  }
];

export default function ChaosSandboxPage() {
  const { incidents, createIncident, updateIncidentStatus, currentUser } = useIncidentStore();
  
  const [selectedExpId, setSelectedExpId] = useState(EXPERIMENTS[0].id);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isInjecting, setIsInjecting] = useState(false);
  const [activeExperiments, setActiveExperiments] = useState<Record<string, string>>({}); // expId -> incidentId

  // Auth permissions states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<'auth_required' | 'insufficient_privileges' | null>(null);

  // Live telemetry mock charts
  const [telemetryCpu, setTelemetryCpu] = useState(15);
  const [telemetryLatency, setTelemetryLatency] = useState(25);

  const currentExperiment = EXPERIMENTS.find(e => e.id === selectedExpId)!;

  useEffect(() => {
    // Check which experiments match active incidents
    const activeMapping: Record<string, string> = {};
    incidents.forEach(inc => {
      if (inc.status !== 'resolved') {
        if (inc.title.includes('PostgreSQL Primary') || inc.title.includes('CPU Exhaustion')) {
          activeMapping['db-cpu'] = inc.id;
        } else if (inc.title.includes('Network Blackhole') || inc.title.includes('AZ isolation')) {
          activeMapping['az-blackhole'] = inc.id;
        } else if (inc.title.includes('Redis OAuth Token') || inc.title.includes('Cache Eviction')) {
          activeMapping['redis-eviction'] = inc.id;
        } else if (inc.title.includes('DDoS burst') || inc.title.includes('API Gateway HTTP Flooder')) {
          activeMapping['gateway-ddos'] = inc.id;
        } else if (inc.title.includes('Kolkata') || inc.title.includes('Thermal Overheat')) {
          activeMapping['facilities-thermal'] = inc.id;
        }
      }
    });
    setActiveExperiments(activeMapping);

    // Compute live telemetry based on active experiments
    const hasDbCpu = activeMapping['db-cpu'];
    const hasGatewayDdos = activeMapping['gateway-ddos'];
    const hasAzBlackhole = activeMapping['az-blackhole'];

    setTelemetryCpu(hasDbCpu ? 98 : 12 + Math.floor(Math.random() * 8));
    setTelemetryLatency(
      hasAzBlackhole ? 5000 :
      hasDbCpu ? 850 :
      hasGatewayDdos ? 420 :
      18 + Math.floor(Math.random() * 12)
    );

  }, [incidents]);

  const handleLaunchExperiment = () => {
    // Authentication & Role Permissions Gate
    if (!currentUser) {
      setAuthError('auth_required');
      return;
    }
    if (currentUser.role !== 'SecurityLead' && currentUser.role !== 'OrgAdmin') {
      setAuthError('insufficient_privileges');
      return;
    }
    setAuthError(null);

    if (activeExperiments[currentExperiment.id]) {
      alert('This experiment is already running on the cluster.');
      return;
    }

    setIsInjecting(true);
    setTerminalLogs([]);

    const logs = [
      `[CHAOS] Initializing Chaos Sandbox container...`,
      `[CHAOS] Target node selected: ${currentExperiment.category} (${currentExperiment.targetService})`,
      ...currentExperiment.logs
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          // Trigger incident creation in global store
          const inc = createIncident({
            title: `[CHAOS] ${currentExperiment.name}: ${currentExperiment.telemetryMetric} Breach`,
            description: `${currentExperiment.description} State forced to ${currentExperiment.chaosState}.`,
            severity: currentExperiment.severity,
            service: currentExperiment.targetService,
            source: 'webhook',
            tags: ['chaos-experiment', currentExperiment.id, 'telemetry-breach']
          });

          setIsInjecting(false);
        }
      }, (index + 1) * 350);
    });
  };

  const handleHaltExperiment = (expId: string) => {
    const incidentId = activeExperiments[expId];
    if (!incidentId) return;

    // Resolve incident in store
    updateIncidentStatus(incidentId, 'resolved', 'Chaos Engine (Auto-Recovery)');

    // Log recovery details to terminal
    setTerminalLogs(prev => [
      ...prev,
      `[CHAOS] Halting experiment "${expId}"...`,
      `[SYS] Stopping stress-ng injection container.`,
      `[SUCCESS] Restored node state to healthy baseline metrics.`,
      `[INFO] Dispatching recovery payload to Sentinel (Incident ${incidentId} resolved).`
    ]);
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <Zap className="h-6 w-6 text-red-500" />
            <span>Chaos Engineering Fault Injector Sandbox</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Inject telemetry anomalies, simulate node stress-testing, and verify automatic alerting pipelines
          </p>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Experiment Directory Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 backdrop-blur-md">
            <h3 className="font-bold text-white text-sm mb-4">Chaos Experiments Directory</h3>

            <div className="space-y-3">
              {EXPERIMENTS.map((exp) => {
                const isActive = activeExperiments[exp.id];
                const isSelected = selectedExpId === exp.id;

                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExpId(exp.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-red-500/50 bg-red-950/10 text-white'
                        : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-bold text-xs leading-none">{exp.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black leading-none ${
                        exp.severity === 'P1' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {exp.severity}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 mt-1.5 line-clamp-1">{exp.description}</p>
                    
                    <div className="flex justify-between items-center w-full mt-3 text-[9px] font-mono">
                      <span>Target: {exp.targetService}</span>
                      {isActive ? (
                        <span className="text-red-400 font-bold animate-pulse flex items-center space-x-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          <span>ACTIVE OUTAGE</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">READY</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Execution & Simulator Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Experiment Description Panel */}
            <div className="md:col-span-2 rounded-2xl border border-gray-800 bg-gray-900/50 p-5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{currentExperiment.name}</h3>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed">{currentExperiment.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-gray-800 bg-gray-950 p-3 text-[11px] font-mono">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">TELEMETRY TARGET</span>
                    <span className="font-bold text-gray-300">{currentExperiment.telemetryMetric}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">METRIC FALLOUT</span>
                    <span className="font-bold text-red-400">{currentExperiment.normalState} ➔ {currentExperiment.chaosState}</span>
                  </div>
                </div>
              </div>

              {authError && (
                <div className="mt-4 p-3 rounded-xl border border-red-500/30 bg-red-950/20 text-[11px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-2 text-red-300">
                    <ShieldAlert className="h-4 w-4 shrink-0 animate-bounce" />
                    <span>
                      {authError === 'auth_required' 
                        ? 'Authentication Required: You must be logged in as a Security Lead to execute stress testing.' 
                        : `Permission Denied: Your role (${currentUser?.role}) is not authorized. Required: SecurityLead.`}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="shrink-0 text-[10px] font-bold text-cyan-400 hover:underline"
                  >
                    {authError === 'auth_required' ? '🔑 Authenticate' : '👤 Switch User'}
                  </button>
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-gray-800/60">
                <button
                  onClick={handleLaunchExperiment}
                  disabled={isInjecting || !!activeExperiments[currentExperiment.id]}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  <span>{isInjecting ? 'Deploying Chaos Agents...' : 'Launch Chaos Experiment'}</span>
                </button>
              </div>
            </div>

            {/* Live Telemetry Fallout Gauges */}
            <div className="md:col-span-1 rounded-2xl border border-gray-800 bg-gray-900/50 p-5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-xs mb-4 flex items-center space-x-1">
                  <Gauge className="h-4 w-4 text-cyan-400" />
                  <span>Telemetry Fallout Monitor</span>
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>DATABASE CPU</span>
                      <span className={`font-bold font-mono ${telemetryCpu > 80 ? 'text-red-400' : 'text-emerald-400'}`}>{telemetryCpu}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-950 rounded overflow-hidden">
                      <div className={`h-full rounded transition-all duration-500 ${telemetryCpu > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${telemetryCpu}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>API LATENCY</span>
                      <span className={`font-bold font-mono ${telemetryLatency > 200 ? 'text-red-400' : 'text-emerald-400'}`}>{telemetryLatency} ms</span>
                    </div>
                    <div className="h-2 w-full bg-gray-950 rounded overflow-hidden">
                      <div className={`h-full rounded transition-all duration-500 ${telemetryLatency > 200 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (telemetryLatency / 1000) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-gray-500 leading-normal border-t border-gray-800/60 pt-3 mt-4">
                * telemetry updates dynamically as experiments inject lock stress or packets drops.
              </div>
            </div>

          </div>

          {/* SRE Chaos Execution Terminal Sandbox */}
          <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col min-h-[220px]">
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-red-500" />
                <span className="font-mono text-xs font-semibold text-gray-300">chaos_sandbox_node ~ logs</span>
              </div>
              <div className="flex space-x-1">
                <span className="h-2 w-2 rounded-full bg-gray-800"></span>
                <span className="h-2.5 w-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 animate-pulse text-[9px] font-bold px-1.5 py-0.2">CONTAINER_RUNNING</span>
              </div>
            </div>

            <div className="p-4 flex-1 font-mono text-xs overflow-y-auto space-y-1.5 text-gray-300">
              {terminalLogs.length === 0 && (
                <p className="text-gray-600 text-center py-12">
                  Select an experiment and click Launch to initialize the execution pipeline logs...
                </p>
              )}
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={
                  log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' :
                  log.includes('[WARN]') ? 'text-red-400' :
                  log.includes('[CHAOS]') ? 'text-purple-400 font-bold' : 'text-gray-300'
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Active Running Experiments Registry */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 backdrop-blur-md">
            <h4 className="font-bold text-white text-xs mb-3">Active Cluster Fault Injections ({Object.keys(activeExperiments).length})</h4>
            
            {Object.keys(activeExperiments).length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">No active chaos experiments currently injecting faults into the cluster.</p>
            ) : (
              <div className="space-y-3">
                {Object.keys(activeExperiments).map((expId) => {
                  const exp = EXPERIMENTS.find(e => e.id === expId)!;
                  
                  return (
                    <div key={expId} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800 gap-3 text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Flame className="h-4 w-4 text-red-500 animate-pulse" />
                          <span className="font-bold text-white">{exp.name}</span>
                          <span className="rounded bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.2 text-[9px] font-bold">INJECTING</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Impact: {exp.telemetryMetric} spiked to {exp.chaosState} on {exp.targetService}</p>
                      </div>

                      <button
                        onClick={() => handleHaltExperiment(expId)}
                        className="py-1.5 px-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold tracking-wide text-[10px] uppercase flex items-center justify-center space-x-1"
                      >
                        <Square className="h-3 w-3" />
                        <span>Halt & Recover Node</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

    </div>
  );
}
