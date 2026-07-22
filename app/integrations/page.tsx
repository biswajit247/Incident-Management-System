'use client';

import React, { useState } from 'react';
import { MessageSquareCode, Save, Send, ShieldAlert, CheckCircle2, Copy, Terminal, ExternalLink } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';

export default function IntegrationsPage() {
  const { incidents } = useIncidentStore();
  const [slackUrl, setSlackUrl] = useState('https://hooks.slack.com/services/T01234567/B89012345/abc123xyz7890def456');
  const [teamsUrl, setTeamsUrl] = useState('https://protiviti.webhook.office.com/webhookb2/a123-b456-c789/IncomingWebhook/xyz987');
  const [channel, setChannel] = useState('#incident-alerts-sre');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isTesting, setIsTesting] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const sampleIncident = incidents[0] || {
    id: 'PRO-9041',
    title: 'Production Database Primary Node High Disk I/O & Connection Saturation',
    severity: 'P1',
    status: 'triggered',
    service: 'Platform & DB',
    assignedTo: { name: 'Biswajit Naskar' },
    videoBridgeUrl: 'https://meet.jit.si/Incident-Command-PRO-9041',
  };

  const slackPayload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 Sentinel P1 Incident Triggered: ${sampleIncident.id}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Title:* ${sampleIncident.title}\n*Severity:* \`${sampleIncident.severity}\` | *Service:* \`${sampleIncident.service}\``
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Status:*\n${sampleIncident.status.toUpperCase()}`
          },
          {
            type: 'mrkdwn',
            text: `*Assigned Responder:*\n${sampleIncident.assignedTo.name}`
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '👉 View Details',
              emoji: true
            },
            url: `https://incidentmanagementsystem.netlify.app/incidents/${sampleIncident.id}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '📹 Join Video Bridge',
              emoji: true
            },
            url: sampleIncident.videoBridgeUrl,
            style: 'danger'
          }
        ]
      }
    ]
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(slackPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestTrigger = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestNotification(`ChatOps Webhook payload successfully posted to Slack channel ${channel}!`);
      setTimeout(() => setTestNotification(null), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 text-xs font-bold border border-cyan-500/30">
                CHATOPS INTEGRATIONS
              </span>
              <h2 className="text-xl font-bold text-white">Slack & MS Teams Webhook Engine</h2>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Configure corporate workspace endpoints to dispatch formatted Block Kit messages on incident triggers
            </p>
          </div>

          {isSaved && (
            <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 animate-pulse">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Webhook Endpoints Saved!</span>
            </div>
          )}
        </div>
      </div>

      {/* Forms & Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Slack Config Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-800/80 pb-3">
            <div className="h-7 w-7 rounded bg-[#4A154B]/20 flex items-center justify-center border border-[#4A154B]/30">
              <span className="font-black text-[#4A154B] text-xs">S</span>
            </div>
            <h3 className="font-bold text-white text-sm">Slack Webhook Setup</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400">Incoming Webhook URL</label>
              <input 
                type="text"
                value={slackUrl}
                onChange={e => setSlackUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-mono text-gray-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400">Target Channel</label>
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="#incident-alerts-sre">#incident-alerts-sre</option>
                  <option value="#security-ops">#security-ops</option>
                  <option value="#facilities-alerts">#facilities-alerts</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 px-4 py-2 text-xs font-bold text-white transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Integration</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Teams Config Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-800/80 pb-3">
            <div className="h-7 w-7 rounded bg-[#4655B5]/20 flex items-center justify-center border border-[#4655B5]/30">
              <span className="font-black text-[#4655B5] text-xs">T</span>
            </div>
            <h3 className="font-bold text-white text-sm">Microsoft Teams Connector Setup</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400">Teams Incoming Webhook Connector URL</label>
              <input 
                type="text"
                value={teamsUrl}
                onChange={e => setTeamsUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-mono text-gray-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400">Target Card Type</label>
                <select
                  disabled
                  className="mt-1 w-full rounded-xl border border-gray-800 bg-gray-950/40 px-3 py-2 text-xs text-gray-400 focus:outline-none"
                >
                  <option>AdaptiveCard v1.5 (Connector)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 px-4 py-2 text-xs font-bold text-white transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Integration</span>
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>

      {/* JSON Payload Preview & Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Payload Preview */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Payload JSON Schema Preview (Slack Block Kit)</h3>
            </div>
            <button
              onClick={copyPayload}
              className="flex items-center space-x-1 rounded-lg border border-gray-800 bg-gray-950 px-2.5 py-1 text-[10px] font-bold text-gray-400 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="rounded-xl border border-gray-950 bg-gray-950 p-4 font-mono text-[10px] text-cyan-300 overflow-x-auto max-h-72">
            {JSON.stringify(slackPayload, null, 2)}
          </pre>
        </div>

        {/* Live Simulation Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-3 mb-4">
              <MessageSquareCode className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">ChatOps Webhook Tester</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Verify webhook communication between Sentinel and your workspace. Clicking dispatch triggers a simulated API call, parsing the Block Kit JSON structure and posting it live.
            </p>

            {testNotification && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-[11px] text-emerald-300 animate-fadeIn">
                {testNotification}
              </div>
            )}
          </div>

          <button
            onClick={handleTestTrigger}
            disabled={isTesting}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 mt-4 transition-all"
          >
            <Send className="h-4 w-4" />
            <span>{isTesting ? 'Sending Webhook...' : 'Test Webhook Integration'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
