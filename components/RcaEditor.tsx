'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  Download, 
  Check, 
  Clock,
  Printer
} from 'lucide-react';
import { Incident, RcaReport, ActionItem } from '@/lib/types';
import { useIncidentStore } from '@/lib/store';

interface RcaEditorProps {
  incident: Incident;
  existingRca?: RcaReport;
}

export default function RcaEditor({ incident, existingRca }: RcaEditorProps) {
  const { saveRcaReport } = useIncidentStore();
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  const [summary, setSummary] = useState(existingRca?.summary || incident.description);
  const [durationMinutes, setDurationMinutes] = useState(existingRca?.impact.durationMinutes || 35);
  const [usersAffected, setUsersAffected] = useState(existingRca?.impact.usersAffected || 12400);
  const [affectedServices, setAffectedServices] = useState(existingRca?.impact.affectedServices.join(', ') || incident.service);
  const [revenueImpact, setRevenueImpact] = useState(existingRca?.impact.revenueImpact || '$4,200 (Estimated)');

  const [fiveWhys, setFiveWhys] = useState<string[]>(
    existingRca?.fiveWhys || [
      `1. Why did ${incident.title} occur? Connection pool handles were exhausted under peak transaction load.`,
      `2. Why were connection handles exhausted? Default pool size cap (50 connections) was unsuited for multi-pod autoscaling burst.`,
      `3. Why was default pool size cap not adjusted? Configuration parameters were inherited from legacy single-node setup.`,
      `4. Why were load testing specs not caught in staging? Staging stress-test profile used synthetic traffic capped at 1,000 req/min.`,
      `5. Why was stress-test capped at low volume? Load test scenarios were not updated after Q1 microservice architecture overhaul.`,
    ]
  );

  const [rootCause, setRootCause] = useState(
    existingRca?.rootCause || 'Outdated connection pool allocation combined with missing automated capacity scaling tests prior to peak deployment.'
  );

  const [detectionDetails, setDetectionDetails] = useState(
    existingRca?.detectionDetails || 'Alert triggered automatically via Datadog Synthetic monitor check on HTTP 5xx error rate.'
  );

  const [mitigationSteps, setMitigationSteps] = useState(
    existingRca?.mitigationSteps || 'Scaled pods from 10 to 25 instances and dynamically updated connection pool limits to 200 handles per pod.'
  );

  const [actionItems, setActionItems] = useState<ActionItem[]>(
    existingRca?.actionItems || [
      {
        id: 'ai-1',
        title: 'Upgrade connection pool default config across all database microservices',
        assignee: incident.assignedTo.name,
        status: 'in_progress',
        priority: 'high',
      },
      {
        id: 'ai-2',
        title: 'Implement production traffic playback load testing in CI staging suite',
        assignee: 'Biswajit Naskar',
        status: 'todo',
        priority: 'high',
      },
    ]
  );

  const handleAddWhy = () => {
    setFiveWhys(prev => [...prev, `${prev.length + 1}. Why...`]);
  };

  const handleRemoveWhy = (index: number) => {
    setFiveWhys(prev => prev.filter((_, i) => i !== index));
  };

  const handleWhyChange = (index: number, text: string) => {
    setFiveWhys(prev => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const handleAddActionItem = () => {
    const newItem: ActionItem = {
      id: `ai-${Date.now()}`,
      title: 'New Action Item title...',
      assignee: incident.assignedTo.name,
      status: 'todo',
      priority: 'medium',
    };
    setActionItems(prev => [...prev, newItem]);
  };

  const handleSave = () => {
    const report: RcaReport = {
      id: existingRca?.id || `RCA-${incident.id.replace('INC-', '')}`,
      incidentId: incident.id,
      organizationId: incident.organizationId || 'org-protiviti-in',
      title: `Root Cause Analysis: ${incident.title}`,
      severity: incident.severity,
      author: incident.assignedTo.name,
      createdAt: existingRca?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary,
      impact: {
        durationMinutes: Number(durationMinutes),
        usersAffected: Number(usersAffected),
        affectedServices: affectedServices.split(',').map(s => s.trim()),
        revenueImpact,
      },
      fiveWhys,
      rootCause,
      detectionDetails,
      mitigationSteps,
      actionItems,
      status: 'completed',
    };

    saveRcaReport(report);
    setIsSavedMsg(true);
    setTimeout(() => setIsSavedMsg(false), 4000);
  };

  const handleExportMarkdown = () => {
    const md = `# Root Cause Analysis (RCA): ${incident.title}
**Incident ID:** ${incident.id}  
**Severity:** ${incident.severity}  
**Author:** ${incident.assignedTo.name}  
**Date:** ${new Date().toLocaleDateString()}

## Executive Summary
${summary}

## Business & Customer Impact
- **Downtime Duration:** ${durationMinutes} minutes
- **Users Impacted:** ${usersAffected}
- **Affected Services:** ${affectedServices}
- **Financial/Revenue Impact:** ${revenueImpact}

## 5 Whys Analysis
${fiveWhys.map(w => `- ${w}`).join('\n')}

## Root Cause Statement
${rootCause}

## Detection & Mitigation
- **Detection Details:** ${detectionDetails}
- **Mitigation Action Taken:** ${mitigationSteps}

## Preventative Action Items
${actionItems.map(ai => `- [${ai.status === 'completed' ? 'x' : ' '}] **${ai.title}** (Assignee: ${ai.assignee}, Priority: ${ai.priority.toUpperCase()})`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCA_${incident.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const actionItemsHtml = actionItems.map(ai => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px; font-weight: bold; color: #1e293b;">${ai.title}</td>
        <td style="padding: 8px; color: #475569;">${ai.assignee}</td>
        <td style="padding: 8px; text-transform: uppercase; color: #475569;">${ai.priority}</td>
        <td style="padding: 8px; text-transform: uppercase; color: ${ai.status === 'completed' ? '#16a34a' : '#ea580c'}; font-weight: 600;">${ai.status.replace('_', ' ')}</td>
      </tr>
    `).join('');

    const fiveWhysHtml = fiveWhys.map(w => `
      <li style="margin-bottom: 8px; color: #334155; line-height: 1.5;">${w}</li>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>RCA_${incident.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-top: 0; font-size: 24px; }
            h2 { color: #1e293b; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; font-size: 18px; }
            .meta-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
            .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; rounded-corners: 6px; text-align: center; border-radius: 8px; }
            .meta-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; }
            .meta-value { font-size: 14px; font-weight: bold; color: #334155; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { text-align: left; background: #f1f5f9; padding: 10px; font-size: 12px; font-weight: bold; color: #475569; }
            ul { padding-left: 20px; }
            .brand { float: right; font-weight: 800; color: #0891b2; letter-spacing: 0.05em; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="brand">PROTIVITI SENTINEL</div>
          <h1>Root Cause Analysis (RCA) Report</h1>
          
          <div style="margin-bottom: 20px; font-size: 12px; color: #64748b;">
            <strong>Incident ID:</strong> ${incident.id} &bull; 
            <strong>Severity:</strong> ${incident.severity} &bull; 
            <strong>Author:</strong> ${incident.assignedTo.name} &bull; 
            <strong>Date Generated:</strong> ${new Date().toLocaleDateString()}
          </div>

          <h2>1. Executive Summary</h2>
          <p style="color: #334155; white-space: pre-wrap;">${summary}</p>

          <h2>2. Business & Service Impact</h2>
          <div class="meta-grid">
            <div class="meta-card">
              <span class="meta-label">Downtime Duration</span>
              <span class="meta-value">${durationMinutes} minutes</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Users Impacted</span>
              <span class="meta-value">${usersAffected}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Affected Services</span>
              <span class="meta-value">${affectedServices}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Revenue Impact</span>
              <span class="meta-value">${revenueImpact}</span>
            </div>
          </div>

          <h2>3. 5 Whys Analysis</h2>
          <ol style="padding-left: 20px;">
            ${fiveWhysHtml}
          </ol>

          <h2>4. Root Cause Statement</h2>
          <p style="color: #334155; font-style: italic; background: #f8fafc; border-left: 4px solid #0891b2; padding: 12px; border-radius: 0 8px 8px 0;">
            ${rootCause}
          </p>

          <h2>5. Detection & Mitigation</h2>
          <p style="margin-bottom: 8px;"><strong>Detection Mechanism:</strong> ${detectionDetails}</p>
          <p><strong>Mitigation Steps:</strong> ${mitigationSteps}</p>

          <h2>6. Preventative Action Items</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Preventative Action Item</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${actionItemsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-red-500/20 text-red-400 px-2.5 py-0.5 text-xs font-bold border border-red-500/30">
              MANDATORY POST-MORTEM
            </span>
            <h2 className="text-xl font-bold text-white">Root Cause Analysis Studio</h2>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Authoring post-mortem for {incident.id} • Assigned Author: {incident.assignedTo.name}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isSavedMsg && (
            <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 animate-pulse">
              <Check className="h-4 w-4" />
              <span>RCA Saved!</span>
            </span>
          )}
          <button
            onClick={handleExportMarkdown}
            className="flex items-center space-x-1.5 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center space-x-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            <Printer className="h-4 w-4" />
            <span>PDF / Print Report</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2 text-xs font-bold text-white hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-500/20"
          >
            <Save className="h-4 w-4" />
            <span>Save & Complete RCA</span>
          </button>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <label className="block text-[10px] font-bold uppercase text-gray-400">Downtime Duration (mins)</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={e => setDurationMinutes(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 font-mono text-sm text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <label className="block text-[10px] font-bold uppercase text-gray-400">Users Impacted</label>
          <input
            type="number"
            value={usersAffected}
            onChange={e => setUsersAffected(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 font-mono text-sm text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <label className="block text-[10px] font-bold uppercase text-gray-400">Affected Services</label>
          <input
            type="text"
            value={affectedServices}
            onChange={e => setAffectedServices(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 font-mono text-sm text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <label className="block text-[10px] font-bold uppercase text-gray-400">Revenue Impact</label>
          <input
            type="text"
            value={revenueImpact}
            onChange={e => setRevenueImpact(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 font-mono text-sm text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Executive Summary */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
          Executive Summary & Overview
        </label>
        <textarea
          rows={3}
          value={summary}
          onChange={e => setSummary(e.target.value)}
          className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-xs text-gray-100 focus:border-red-500 focus:outline-none"
        />
      </div>

      {/* 5 Whys Analysis Studio */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-sm">5 Whys Root Cause Analysis Breakdown</h3>
            <p className="text-xs text-gray-400">Iterative interrogative technique to drill down to fundamental cause</p>
          </div>
          <button
            onClick={handleAddWhy}
            className="flex items-center space-x-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Why Step</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {fiveWhys.map((why, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xs font-bold font-mono">
                {i + 1}
              </span>
              <input
                type="text"
                value={why}
                onChange={e => handleWhyChange(i, e.target.value)}
                className="flex-1 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-100 focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={() => handleRemoveWhy(i)}
                className="p-2 text-gray-500 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Root Cause Statement & Mitigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
          <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
            Fundamental Root Cause Statement
          </label>
          <textarea
            rows={4}
            value={rootCause}
            onChange={e => setRootCause(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-xs text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
          <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
            Mitigation Actions Taken
          </label>
          <textarea
            rows={4}
            value={mitigationSteps}
            onChange={e => setMitigationSteps(e.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-gray-950 p-3 text-xs text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Preventative Action Items */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-sm">Preventative Action Items</h3>
            <p className="text-xs text-gray-400">Track Engineering backlog tasks to prevent recurrence</p>
          </div>
          <button
            onClick={handleAddActionItem}
            className="flex items-center space-x-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Action Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {actionItems.map((ai, index) => (
            <div key={ai.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-800 bg-gray-950 p-3 text-xs">
              <input
                type="text"
                value={ai.title}
                onChange={e => {
                  const copy = [...actionItems];
                  copy[index].title = e.target.value;
                  setActionItems(copy);
                }}
                className="flex-1 min-w-[200px] rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-gray-100 focus:border-red-500 focus:outline-none"
              />
              <input
                type="text"
                value={ai.assignee}
                placeholder="Assignee"
                onChange={e => {
                  const copy = [...actionItems];
                  copy[index].assignee = e.target.value;
                  setActionItems(copy);
                }}
                className="w-36 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-gray-100 focus:border-red-500 focus:outline-none"
              />
              <select
                value={ai.priority}
                onChange={e => {
                  const copy = [...actionItems];
                  copy[index].priority = e.target.value as any;
                  setActionItems(copy);
                }}
                className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-gray-100 focus:border-red-500 focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <select
                value={ai.status}
                onChange={e => {
                  const copy = [...actionItems];
                  copy[index].status = e.target.value as any;
                  setActionItems(copy);
                }}
                className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-gray-100 focus:border-red-500 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
