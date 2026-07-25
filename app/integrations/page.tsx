'use client';

import React, { useState } from 'react';
import { MessageSquareCode, Save, Send, ShieldAlert, CheckCircle2, Copy, Terminal, ExternalLink } from 'lucide-react';
import { useIncidentStore } from '@/lib/store';

export default function IntegrationsPage() {
  const { incidents, acknowledgeIncident, updateIncidentStatus, currentUser } = useIncidentStore();
  const [slackUrl, setSlackUrl] = useState('https://hooks.slack.com/services/T01234567/B89012345/abc123xyz7890def456');
  const [teamsUrl, setTeamsUrl] = useState('https://protiviti.webhook.office.com/webhookb2/a123-b456-c789/IncomingWebhook/xyz987');
  const [channel, setChannel] = useState('#incident-alerts-sre');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isTesting, setIsTesting] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  // ChatOps Slack Command Simulator states
  const [slackCommand, setSlackCommand] = useState('');
  const [slackMessages, setSlackMessages] = useState<any[]>([
    {
      sender: 'Sentinel Bot',
      avatar: '/bot-avatar.png',
      isBot: true,
      text: '🤖 Welcome SRE team! I am ready to process your `/sentinel` slash commands. Type `/sentinel help` to see available operations.',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);

  const handleSlackCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slackCommand.trim()) return;

    const command = slackCommand.trim();
    const timestamp = new Date().toLocaleTimeString();
    
    // Add user message
    const userMsg = {
      sender: currentUser?.name || 'Biswajit Naskar',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isBot: false,
      text: command,
      timestamp,
    };
    setSlackMessages(prev => [...prev, userMsg]);
    setSlackCommand('');

    // Process Bot reply
    setTimeout(() => {
      let replyText = '';
      if (command.startsWith('/sentinel')) {
        const parts = command.split(' ');
        const subCommand = parts[1];
        const arg = parts[2];

        if (subCommand === 'list') {
          const active = incidents.filter(i => i.status !== 'resolved');
          if (active.length === 0) {
            replyText = '✅ No active incidents found in the queue.';
          } else {
            replyText = `📂 *Active Incident Stream:* \n` + active.map(i => `• *${i.id}* - ${i.title} [_${i.severity}_ | _${i.status.toUpperCase()}_]`).join('\n');
          }
        } else if (subCommand === 'ack') {
          if (!arg) {
            replyText = '❌ Error: Please specify an Incident ID (e.g. `/sentinel ack PRO-9041`).';
          } else {
            const found = incidents.find(i => i.id.toLowerCase() === arg.toLowerCase());
            if (!found) {
              replyText = `❌ Error: Incident *${arg}* not found in the active workspace.`;
            } else if (found.status !== 'triggered') {
              replyText = `⚠️ Warning: Incident *${arg}* is already in *${found.status.toUpperCase()}* status.`;
            } else {
              acknowledgeIncident(found.id, currentUser?.name || 'Slack ChatOps');
              replyText = `✅ Incident *${found.id}* successfully Acknowledged! SLA TTA timer halted.`;
            }
          }
        } else if (subCommand === 'resolve') {
          if (!arg) {
            replyText = '❌ Error: Please specify an Incident ID (e.g. `/sentinel resolve PRO-9041`).';
          } else {
            const found = incidents.find(i => i.id.toLowerCase() === arg.toLowerCase());
            if (!found) {
              replyText = `❌ Error: Incident *${arg}* not found in the active workspace.`;
            } else if (found.status === 'resolved') {
              replyText = `⚠️ Warning: Incident *${arg}* is already *RESOLVED*.`;
            } else {
              updateIncidentStatus(found.id, 'resolved', currentUser?.name || 'Slack ChatOps');
              replyText = `🎉 Incident *${found.id}* successfully resolved! SLA TTR timer halted. Please file the root cause analysis post-mortem in the RCA studio.`;
            }
          }
        } else if (subCommand === 'help' || !subCommand) {
          replyText = `ℹ️ *Available Sentinel Commands:*\n` +
                      `• \`/sentinel list\` - Display all active incidents.\n` +
                      `• \`/sentinel ack <incident-id>\` - Acknowledge a triggered incident.\n` +
                      `• \`/sentinel resolve <incident-id>\` - Resolve an active incident.\n` +
                      `• \`/sentinel help\` - Display this help log.`;
        } else {
          replyText = `❌ Unknown subcommand: *${subCommand}*. Type \`/sentinel help\` to see available operations.`;
        }
      } else {
        replyText = `⚠️ Sentinel Bot only processes commands starting with \`/sentinel \`.`;
      }

      setSlackMessages(prev => [
        ...prev,
        {
          sender: 'Sentinel Bot',
          avatar: '/bot-avatar.png',
          isBot: true,
          text: replyText,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    }, 600);
  };

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

      {/* Interactive Slack ChatOps Simulator Console */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <MessageSquareCode className="h-4.5 w-4.5 text-cyan-400" />
              <span>Interactive ChatOps Simulator (Slack Sandbox)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Interact with Sentinel directly through chat commands. Changes apply to the live state store!
            </p>
          </div>
          <span className="rounded-full bg-[#3F0E40] border border-[#522653] px-2.5 py-1 text-[10px] font-mono text-[#D1C2D2] flex items-center space-x-1">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span>#incident-ops</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Chat Feed */}
          <div className="lg:col-span-3 flex flex-col justify-between rounded-xl border border-gray-800 bg-gray-950/80 p-4 h-[350px]">
            
            {/* Scrollable messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {slackMessages.map((msg, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs">
                  {msg.isBot ? (
                    <div className="h-7 w-7 rounded bg-[#4A154B] flex items-center justify-center font-bold text-white text-[10px] shrink-0 border border-[#6b256c]">
                      🤖
                    </div>
                  ) : (
                    <img 
                      src={msg.avatar} 
                      alt={msg.sender} 
                      className="h-7 w-7 rounded-full object-cover shrink-0 border border-gray-700"
                    />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-baseline space-x-1.5">
                      <span className={`font-bold ${msg.isBot ? 'text-cyan-400' : 'text-gray-200'}`}>
                        {msg.sender}
                      </span>
                      {msg.isBot && (
                        <span className="rounded bg-[#2E3C43] px-1 py-0.2 text-[8px] font-bold text-gray-300 uppercase">
                          APP
                        </span>
                      )}
                      <span className="text-[9px] text-gray-500 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed break-words font-mono whitespace-pre-line text-[11px]">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSlackCommandSubmit} className="mt-3 border-t border-gray-800 pt-3">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={slackCommand}
                  onChange={e => setSlackCommand(e.target.value)}
                  placeholder='Send message to #incident-ops (e.g. "/sentinel list", "/sentinel help")'
                  className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#4A154B] focus:outline-none pr-10 font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-2 rounded-lg bg-[#4A154B] hover:bg-[#5a1c5b] p-1.5 text-white transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

          </div>

          {/* Quick Help Cheat Sheet */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                ⚡ Slack Command Guide
              </span>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Type these commands directly in the channel box to control Sentinel:
              </p>
              
              <div className="space-y-2 pt-1">
                <div className="rounded border border-gray-850 bg-gray-950 p-2 font-mono text-[9px] cursor-pointer hover:border-cyan-500/40"
                     onClick={() => setSlackCommand('/sentinel list')}>
                  <span className="text-cyan-400 font-bold">/sentinel list</span>
                  <p className="text-gray-500 text-[8px] mt-0.5">Show active incidents</p>
                </div>

                <div className="rounded border border-gray-850 bg-gray-950 p-2 font-mono text-[9px] cursor-pointer hover:border-cyan-500/40"
                     onClick={() => setSlackCommand('/sentinel ack ')}>
                  <span className="text-cyan-400 font-bold">/sentinel ack &lt;id&gt;</span>
                  <p className="text-gray-500 text-[8px] mt-0.5">Acknowledge an incident</p>
                </div>

                <div className="rounded border border-gray-850 bg-gray-950 p-2 font-mono text-[9px] cursor-pointer hover:border-cyan-500/40"
                     onClick={() => setSlackCommand('/sentinel resolve ')}>
                  <span className="text-cyan-400 font-bold">/sentinel resolve &lt;id&gt;</span>
                  <p className="text-gray-500 text-[8px] mt-0.5">Resolve an incident</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-cyan-950/20 border border-cyan-850 p-2.5 text-[9px] text-cyan-300 leading-relaxed">
              💡 Clicking any command block above will copy it straight to your input field!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
