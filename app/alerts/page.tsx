'use client';

import React, { useState } from 'react';
import { Radio, Code2, Copy, Check, Send, ShieldAlert, Terminal, Play } from 'lucide-react';
import AlertSimulatorModal from '@/components/AlertSimulatorModal';

export default function AlertsPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const snippets = [
    {
      title: 'Prometheus Alertmanager Webhook Config (`alertmanager.yml`)',
      language: 'yaml',
      code: `receivers:
  - name: 'sentinel-webhook'
    webhook_configs:
      - url: 'https://ops.company.internal/api/alerts/webhook'
        send_resolved: true
        http_config:
          bearer_token: 'sentinel_sec_token_9042x'`,
    },
    {
      title: 'Datadog Webhook Payload Template',
      language: 'json',
      code: `{
  "event_type": "datadog_alert",
  "title": "Payment Service 504 Error Rate > 15%",
  "severity": "P1",
  "service": "Payments Engine",
  "metric_value": "18.5%",
  "tags": ["env:production", "team:payments"]
}`,
    },
    {
      title: 'cURL Command (Direct Alert Ingest Test)',
      language: 'bash',
      code: `curl -X POST http://localhost:3000/api/alerts/webhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Synthetic DB Pool Saturation Test",
    "severity": "P1",
    "service": "Platform & DB",
    "description": "Simulated connection leak on primary postgres node."
  }'`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 text-xs font-bold border border-cyan-500/30">
              PRODUCTION WEBHOOK ENDPOINT
            </span>
            <h1 className="text-2xl font-black text-white">Production Alert Ingestion Hub</h1>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Real-time telemetry ingestion from Datadog, Prometheus, AWS CloudWatch, Grafana & custom REST APIs
          </p>
        </div>

        <button
          onClick={() => setIsSimModalOpen(true)}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>+ Trigger Emergency Alert</span>
        </button>
      </div>

      {/* Endpoint Live Card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5 font-mono text-xs text-gray-300 space-y-2">
        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center space-x-2 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>POST /api/alerts/webhook (ACTIVE)</span>
          </span>
          <span className="text-[10px] text-gray-500">HTTP/2 • SSL Encrypted</span>
        </div>
        <p className="text-gray-400 font-sans text-xs">
          This endpoint automatically deduplicates incoming JSON payloads, calculates SLA TTA/TTR deadlines based on severity, and pages the assigned On-Call engineer via Twilio SMS & Voice Call.
        </p>
      </div>

      {/* Code Snippets */}
      <div className="space-y-4">
        <h2 className="font-bold text-white text-base flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-amber-400" />
          <span>Integration Snippets & Payloads</span>
        </h2>

        <div className="space-y-4">
          {snippets.map((snip, i) => (
            <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-2.5">
                <span className="font-bold text-gray-200 text-xs">{snip.title}</span>
                <button
                  onClick={() => handleCopy(snip.code, i)}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-amber-300/90 overflow-x-auto bg-gray-950/80">
                {snip.code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {isSimModalOpen && (
        <AlertSimulatorModal onClose={() => setIsSimModalOpen(false)} />
      )}
    </div>
  );
}
