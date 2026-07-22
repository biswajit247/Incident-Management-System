'use client';

import React, { useState } from 'react';
import { X, Radio, Send, Zap, CheckCircle2, ShieldAlert, Code2 } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import { Severity } from '@/lib/types';

interface AlertSimulatorModalProps {
  onClose: () => void;
}

const PRESETS = [
  {
    name: 'Datadog: Payment Gateway 5xx Spike (P1)',
    source: 'datadog' as const,
    severity: 'P1' as Severity,
    service: 'Payments Engine',
    title: 'Payment Gateway HTTP 504 Timeout rate > 20% on Checkout Pods',
    description: 'Datadog Synthetic Monitor alert: Connection pool exhaustion detected on outbound Stripe payment intent calls. 504 timeouts impacting live purchases.',
    tags: ['stripe', 'payment', 'p1-outage'],
  },
  {
    name: 'Prometheus: DB Lock Saturation (P1)',
    source: 'prometheus' as const,
    severity: 'P1' as Severity,
    service: 'Platform & DB',
    title: 'PostgreSQL Primary Node Backend Max Connections Exceeded',
    description: 'Prometheus Alert: postgres_pg_stat_database_numbackends > 990 (Limit: 1000). Active lock contention on customer_accounts table.',
    tags: ['postgres', 'database', 'locking'],
  },
  {
    name: 'CloudWatch: Redis Cache Eviction (P2)',
    source: 'cloudwatch' as const,
    severity: 'P2' as Severity,
    service: 'Security & Auth',
    title: 'Redis OAuth Token Store MaxMemory Eviction High Threshold',
    description: 'CloudWatch Metric Alert: Cache eviction rate reached 4,500 keys/sec. Active sessions being terminated prematurely.',
    tags: ['redis', 'auth', 'sessions'],
  },
  {
    name: 'Custom Webhook Alert (P3)',
    source: 'webhook' as const,
    severity: 'P3' as Severity,
    service: 'SRE Core',
    title: 'Kafka Consumer Lag Spike in Analytics Ingestion Stream',
    description: 'Custom Webhook Alert: Ingestion worker lag increased past 120,000 pending messages.',
    tags: ['kafka', 'analytics', 'lag'],
  },
];

export default function AlertSimulatorModal({ onClose }: AlertSimulatorModalProps) {
  const { createIncident } = useIncidentStore();
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customTitle, setCustomTitle] = useState(PRESETS[0].title);
  const [customDesc, setCustomDesc] = useState(PRESETS[0].description);
  const [severity, setSeverity] = useState<Severity>(PRESETS[0].severity);
  const [service, setService] = useState(PRESETS[0].service);
  const [source, setSource] = useState(PRESETS[0].source);

  const [simulatedLog, setSimulatedLog] = useState<string[]>([]);
  const [isInjecting, setIsInjecting] = useState(false);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const preset = PRESETS[idx];
    setCustomTitle(preset.title);
    setCustomDesc(preset.description);
    setSeverity(preset.severity);
    setService(preset.service);
    setSource(preset.source);
  };

  const handleFireAlert = () => {
    setIsInjecting(true);
    setSimulatedLog([
      `[00:00] Ingesting HTTP POST webhook payload from ${source.toUpperCase()}...`,
      `[00:01] Parsing telemetry metrics... Severity determined as ${severity}.`,
      `[00:02] Deduplicating incident against open tickets... No existing open match found.`,
      `[00:03] Querying active On-Call schedule rotation for service: ${service}...`,
      `[00:04] Match found! Routing ticket to Tier 1 On-Call Responder.`,
      `[00:05] Triggering automated Twilio SMS & Voice Pager alert...`,
      `[00:06] Incident created successfully!`,
    ]);

    setTimeout(() => {
      const created = createIncident({
        title: customTitle,
        description: customDesc,
        severity,
        service,
        source,
      });

      setIsInjecting(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Operational Alert Dispatcher</h2>
              <p className="text-xs text-gray-400">Manually dispatch monitoring webhooks & trigger automated escalation rules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Select Monitoring Alert Preset
          </label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(idx)}
                className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedPresetIndex === idx
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-medium'
                    : 'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{preset.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    preset.severity === 'P1' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {preset.severity}
                  </span>
                </div>
                <span className="mt-1 text-[11px] text-gray-400 line-clamp-1">{preset.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-gray-400 font-medium mb-1">Incident Title</label>
            <input
              type="text"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 font-medium mb-1">Severity</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as Severity)}
                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1">Service</label>
              <input
                type="text"
                value={service}
                onChange={e => setService(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1">Source</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as any)}
                className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="datadog">Datadog</option>
                <option value="prometheus">Prometheus</option>
                <option value="cloudwatch">AWS CloudWatch</option>
                <option value="webhook">Custom Webhook</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Simulation Log Terminal output */}
        {isInjecting && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-black p-3 font-mono text-[11px] text-amber-400 space-y-1">
            {simulatedLog.map((log, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-amber-500 animate-spin" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-800 pt-4">
          <button
            onClick={onClose}
            disabled={isInjecting}
            className="rounded-lg border border-gray-800 px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleFireAlert}
            disabled={isInjecting}
            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-xs font-bold text-gray-950 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-amber-500/20"
          >
            <Send className="h-4 w-4" />
            <span>{isInjecting ? 'Dispatching Payload...' : 'Dispatch Webhook & Route Alert'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
