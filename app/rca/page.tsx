'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  ArrowRight, 
  User, 
  ShieldCheck,
  Sparkles,
  Terminal,
  Copy,
  Save,
  Cpu,
  Check,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { useIncidentStore } from '@/lib/store';
import IncidentOccurrenceFormModal from '@/components/IncidentOccurrenceFormModal';

const RCA_TEMPLATES: Record<string, {
  fiveWhys: string[];
  rootCause: string;
  detectionDetails: string;
  mitigationSteps: string;
  actionItems: { title: string; assignee: string; priority: 'high' | 'medium' | 'low' }[];
}> = {
  'Code Defect': {
    fiveWhys: [
      "Why did the service crash? (A null pointer exception occurred in the payment parsing routing.)",
      "Why did a null pointer occur? (The incoming webhook payload was missing the optional billing_zip field.)",
      "Why was the webhook payload missing billing_zip? (The third-party payment partner updated their API payload schema.)",
      "Why was the team unaware of the schema update? (The API webhook schema was not pinned to a specific version in production.)",
      "Why was the API schema not version-pinned? (The partner integration lacked regression testing against external API version changes.)"
    ],
    rootCause: "Missing schema validation and API version pinning on incoming third-party payment webhooks, leading to unhandled runtime parsing exceptions.",
    detectionDetails: "Automated Prometheus alert triggered on high rate of 500 responses on payment gateway routing endpoints.",
    mitigationSteps: "Hotpatched the payload parser logic to gracefully support fallback values for zip codes and initiated a rollback to the previous deployment build.",
    actionItems: [
      { title: "Gracefully parse missing zip fields in webhook requests", assignee: "Biswajit Naskar", priority: "high" },
      { title: "Setup API schema contract testing in CI pipeline", assignee: "SecOps Shift A", priority: "medium" }
    ]
  },
  'Database Query Timeout': {
    fiveWhys: [
      "Why did the application return 500 errors? (Because the database connection pool was exhausted.)",
      "Why was the connection pool exhausted? (Transactions were waiting on database lock releases.)",
      "Why were transactions waiting on database lock releases? (An unindexed query locked the user records table.)",
      "Why was an unindexed query run in production? (A new dashboard feature queries user activity logs on login.)",
      "Why was the dashboard query launched without verification? (The database migrations script lacked query analyzer index validations.)"
    ],
    rootCause: "Unindexed analytics queries executing on user login, causing table locks and connection pool exhaustion under high concurrency.",
    detectionDetails: "Grafana dashboard reported database CPU spikes to 99% and connection pool wait times exceeding 5000ms.",
    mitigationSteps: "Identified locking PID in Postgres console, ran PG_TERMINATE_BACKEND, and applied database migration index concurrently.",
    actionItems: [
      { title: "Apply concurrent index on user activity logs table", assignee: "Biswajit Naskar", priority: "high" },
      { title: "Configure alert thresholds for slow query telemetry", assignee: "SecOps Lead", priority: "medium" }
    ]
  },
  'AWS Infrastructure Issue': {
    fiveWhys: [
      "Why was the application unavailable? (Because the primary availability zone became unreachable.)",
      "Why was AZ unreachable? (A physical hardware failure occurred in AWS us-east-1a.)",
      "Why did the app not failover? (The standby replica was located in the same subnetwork AZ.)",
      "Why was the standby located in the same AZ? (Multi-AZ failover was disabled during the last database maintenance window.)",
      "Why was Multi-AZ failover disabled? (No automated configuration check validates Multi-AZ state daily.)"
    ],
    rootCause: "Physical hardware outage in AWS us-east-1a coupled with disabled database standby replica failover settings.",
    detectionDetails: "CloudWatch alert triggered on target group health check failures and node packet loss.",
    mitigationSteps: "Manually triggered failover to standby in us-east-1b and re-provisioned application instances across secondary subnetworks.",
    actionItems: [
      { title: "Enable AWS Multi-AZ failover across databases", assignee: "Biswajit Naskar", priority: "high" },
      { title: "Add Terraform compliance checks for cross-region configuration", assignee: "SecOps Team", priority: "medium" }
    ]
  },
  'Config Drift': {
    fiveWhys: [
      "Why did the service fail to authenticate? (Because the API signature validation failed.)",
      "Why did validation fail? (The secret key was out of sync between Auth and API Gateway.)",
      "Why was the secret key out of sync? (A manual update was made in the API Gateway dashboard.)",
      "Why was the secret key updated manually? (A troubleshooting session bypassed GitOps pipeline.)",
      "Why was the GitOps pipeline bypassed? (Emergency configuration drift detection was disabled.)"
    ],
    rootCause: "Manual configuration override in API Gateway dashboard resulting in token validation keys mismatch.",
    detectionDetails: "Automated alert on authorization error rates exceeding 25% within 5 minutes.",
    mitigationSteps: "Re-synced the validation keys from Vault to the API gateway and verified token verification payload returns 200.",
    actionItems: [
      { title: "Re-sync all secret keys via Vault configurations", assignee: "Biswajit Naskar", priority: "high" },
      { title: "Enable Config Drift detection alerting on AWS CloudTrail", assignee: "SecOps Lead", priority: "medium" }
    ]
  },
  'Human Operator Error': {
    fiveWhys: [
      "Why was all user traffic dropped? (Because the primary routing tables were purged.)",
      "Why were routing tables purged? (A script was run with root privileges in the wrong terminal session.)",
      "Why was it run in the wrong terminal session? (The terminal shell session prompt did not color-code production.)",
      "Why did the operator have root access? (Least privilege access controls were not enforced on SRE terminals.)",
      "Why were access controls not enforced? (No automated session credential lifecycle management exists.)"
    ],
    rootCause: "Execution of destructive cleaning script in production environment due to lack of environment session visual tags and privileged commands guardrails.",
    detectionDetails: "Ping alerts triggered immediately on external DNS endpoints and route tables return null.",
    mitigationSteps: "Re-applied route table states using git history backup files and restored BGP routing pathways.",
    actionItems: [
      { title: "Implement production CLI color-coding shell profile", assignee: "Biswajit Naskar", priority: "high" },
      { title: "Setup dual-custody authorization for routing purges", assignee: "SecOps Team", priority: "high" }
    ]
  }
};

export default function RcaListPage() {
  const { isLoaded, rcaReports, incidents, allIncidents, saveRcaReport, updateRcaActionItemStatus, activeOrgId, currentUser } = useIncidentStore();
  
  // Modal state
  const [selectedIncidentForForm, setSelectedIncidentForForm] = useState<any>(null);

  // Tab state
  const [activeView, setActiveView] = useState<'workspace' | 'tasks'>('workspace');

  // Generator states
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [category, setCategory] = useState('Code Defect');
  const [duration, setDuration] = useState('45');
  const [usersAffected, setUsersAffected] = useState('1500');
  const [revenueImpact, setRevenueImpact] = useState('$4,500.00');
  const [authorName, setAuthorName] = useState('Biswajit Naskar');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (currentUser?.role === 'Reporter') {
      setActiveView('tasks');
    }
  }, [currentUser]);

  if (!isLoaded) return null;

  // Find resolved incidents that lack an RCA
  const pendingRcaIncidents = incidents.filter(
    i => (i.severity === 'P1' || i.severity === 'P2') && i.status === 'resolved' && !i.rcaId
  );

  // Filter list of eligible incidents for manual selector (resolved or active)
  const eligibleIncidents = (allIncidents || incidents).filter(i => !rcaReports.some(r => r.incidentId === i.id));

  // Gather all Action Items from all RCA reports
  const allActionItems = rcaReports.flatMap(report => 
    report.actionItems.map(item => ({
      ...item,
      reportId: report.id,
      reportTitle: report.title,
      reportSeverity: report.severity,
      incidentId: report.incidentId
    }))
  );

  const todoTasks = allActionItems.filter(t => t.status === 'todo');
  const inProgressTasks = allActionItems.filter(t => t.status === 'in_progress');
  const completedTasks = allActionItems.filter(t => t.status === 'completed');

  const handleGenerateRca = () => {
    if (!selectedIncidentId) {
      alert('Please select an incident to generate the RCA.');
      return;
    }

    const targetIncident = (allIncidents || incidents).find(i => i.id === selectedIncidentId);
    if (!targetIncident) return;

    setIsGenerating(true);
    setTerminalLogs([]);
    setGeneratedReport(null);
    setIsSaved(false);

    const logs = [
      `[INFO] Initializing AI Post-Mortem compilation sequence...`,
      `[INFO] Target Incident ID: ${targetIncident.id} ("${targetIncident.title}")`,
      `[TRACE] Querying Elasticsearch logs during incident epoch window...`,
      `[DEBUG] Correlating trace IDs across services: gateway-mesh ➔ system-service`,
      `[WARN] Found telemetry anomalies corresponding to Root Cause: ${category}`,
      `[TRACE] Executing recursive 5 Whys derivation tree...`,
      `[INFO] Correlating affected practice area: ${targetIncident.service}`,
      `[SUCCESS] Isolated root trigger: ${RCA_TEMPLATES[category].rootCause}`,
      `[INFO] Generating Post-Mortem compliance templates...`,
      `[SUCCESS] Post-Mortem report draft compiled successfully.`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          // Generate actual report draft
          const template = RCA_TEMPLATES[category];
          const newReport = {
            id: `RCA-${targetIncident.id.replace('PRO-', '').replace('INC-', '')}`,
            incidentId: targetIncident.id,
            organizationId: activeOrgId || 'org-1',
            title: `Post-Mortem: ${targetIncident.title}`,
            severity: targetIncident.severity,
            author: authorName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            summary: `This post-mortem details the event, impact, and mitigation steps for the ${targetIncident.title} incident. Under heavy traffic conditions, the system encountered issues leading to downtime.`,
            impact: {
              durationMinutes: parseInt(duration) || 30,
              usersAffected: parseInt(usersAffected) || 1000,
              affectedServices: [targetIncident.service],
              revenueImpact: revenueImpact
            },
            fiveWhys: template.fiveWhys,
            rootCause: template.rootCause,
            detectionDetails: template.detectionDetails,
            mitigationSteps: template.mitigationSteps,
            actionItems: template.actionItems.map((item, idx) => ({
              id: `AI-RCA-${targetIncident.id.replace('PRO-', '').replace('INC-', '')}-${idx + 1}`,
              title: item.title,
              assignee: item.assignee,
              status: 'todo' as const,
              priority: item.priority
            })),
            status: 'completed' as const
          };
          setGeneratedReport(newReport);
          setIsGenerating(false);
        }
      }, (index + 1) * 300);
    });
  };

  const handleCopyMarkdown = () => {
    if (!generatedReport) return;
    
    const markdown = `
# ${generatedReport.title} (${generatedReport.id})
**Incident ID:** ${generatedReport.incidentId}
**Date Generated:** ${new Date(generatedReport.createdAt).toLocaleDateString()}
**Lead Investigator:** ${generatedReport.author}

## Executive Summary
${generatedReport.summary}

## Impact Statistics
- **Downtime Duration:** ${generatedReport.impact.durationMinutes} minutes
- **Users Affected:** ${generatedReport.impact.usersAffected}
- **Practice Area:** ${generatedReport.impact.affectedServices.join(', ')}
- **Revenue Impact:** ${generatedReport.impact.revenueImpact}

## 5 Whys Analysis
${generatedReport.fiveWhys.map((why: string, i: number) => `${i + 1}. ${why}`).join('\n')}

## Isolated Root Cause
${generatedReport.rootCause}

## Detection Details
${generatedReport.detectionDetails}

## Mitigation & Resolution Steps
${generatedReport.mitigationSteps}

## Preventative Action Items
${generatedReport.actionItems.map((item: any) => `- [ ] **${item.id}**: ${item.title} (Assignee: ${item.assignee}, Priority: ${item.priority.toUpperCase()})`).join('\n')}
`;

    navigator.clipboard.writeText(markdown.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToStore = () => {
    if (!generatedReport) return;
    saveRcaReport(generatedReport);
    setIsSaved(true);
    
    // Clear selections
    setTimeout(() => {
      setGeneratedReport(null);
      setSelectedIncidentId('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-red-500" />
            <span>Root Cause Analysis & Post-Mortem Studio</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Mandatory post-incident reports, automated 5 Whys compilation, and compliance documentation
          </p>
        </div>
      </div>

      {/* View Tabs */}
      {currentUser?.role !== 'Reporter' && (
        <div className="flex items-center space-x-2 border-b border-gray-800 pb-2 text-xs">
          <button
            onClick={() => setActiveView('workspace')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2 font-bold transition-colors ${
              activeView === 'workspace'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Post-Mortem Studio Workspace</span>
          </button>

          <button
            onClick={() => setActiveView('tasks')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-2 font-bold transition-colors ${
              activeView === 'tasks'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Preventative Action Board</span>
          </button>
        </div>
      )}

      {activeView === 'workspace' && (
        <>
          {/* Pending RCA Alert Banner (if any) */}
      {pendingRcaIncidents.length > 0 && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertOctagon className="h-6 w-6 text-amber-400 animate-bounce" />
              <div>
                <h3 className="font-bold text-amber-200 text-sm">
                  {pendingRcaIncidents.length} Pending Post-Mortem Report{pendingRcaIncidents.length > 1 ? 's' : ''} Required
                </h3>
                <p className="text-xs text-amber-300/80">
                  Critical & High severity incidents resolved without an official RCA report on file.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedIncidentId(pendingRcaIncidents[0].id)}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-gray-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
            >
              Select First Pending →
            </button>
          </div>
        </div>
      )}

      {/* Interactive AI Post-Mortem Generator workspace */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-300">
            ✨ AI Post-Mortem & 5 Whys Generator Workspace
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Column */}
          <div className="space-y-4 lg:col-span-1 border-r border-gray-800/80 pr-0 lg:pr-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Select Target Incident:
              </label>
              <select
                value={selectedIncidentId}
                onChange={e => setSelectedIncidentId(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-medium text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- Choose Incident --</option>
                {eligibleIncidents.map(i => (
                  <option key={i.id} value={i.id}>
                    [{i.severity}] {i.id} - {i.title.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Duration (mins):
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Users Affected:
                </label>
                <input
                  type="number"
                  value={usersAffected}
                  onChange={e => setUsersAffected(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Revenue Impact:
                </label>
                <input
                  type="text"
                  value={revenueImpact}
                  onChange={e => setRevenueImpact(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  RCA Lead Author:
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Root Cause Category:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-medium text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Code Defect">💻 Code Defect</option>
                <option value="Database Query Timeout">📉 Database Query Timeout</option>
                <option value="AWS Infrastructure Issue">☁️ AWS Infrastructure Issue</option>
                <option value="Config Drift">⚙️ Configuration Drift</option>
                <option value="Human Operator Error">👤 Human Operator Error</option>
              </select>
            </div>

            <button
              onClick={handleGenerateRca}
              disabled={isGenerating || !selectedIncidentId}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isGenerating ? 'Compiling Analysis...' : '✨ Auto-Generate AI RCA Report'}</span>
            </button>
          </div>

          {/* Interactive Output Column */}
          <div className="lg:col-span-2 flex flex-col min-h-[300px] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            
            {/* Terminal Tab Bar */}
            <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span className="font-mono text-xs font-semibold text-gray-300">RCA_COMPILER_SANDBOX ~ logs</span>
              </div>
              <div className="flex space-x-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 font-mono text-xs overflow-y-auto space-y-2">
              {terminalLogs.length === 0 && !generatedReport && (
                <div className="text-gray-500 text-center py-12">
                  <Cpu className="mx-auto h-8 w-8 text-gray-700 animate-pulse mb-2" />
                  <span>Configure metrics and trigger generator on the left to start compiling diagnostic post-mortems...</span>
                </div>
              )}

              {/* Terminal sequence logs */}
              {terminalLogs.map((log, i) => (
                <div key={i} className={`leading-relaxed ${
                  log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' :
                  log.includes('[WARN]') ? 'text-amber-400' :
                  log.includes('[INFO]') ? 'text-cyan-400' : 'text-gray-300'
                }`}>
                  {log}
                </div>
              ))}

              {/* Generated Document Standard */}
              {generatedReport && (
                <div className="mt-4 border border-cyan-800/40 bg-cyan-950/15 p-5 rounded-xl space-y-4 font-sans text-gray-300 print:bg-white print:text-black">
                  
                  {/* Document Control Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-800/30 pb-3 gap-2">
                    <div>
                      <h3 className="font-black text-white text-base print:text-black">
                        {generatedReport.title}
                      </h3>
                      <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">
                        Document Control: {generatedReport.id} • STATUS: {generatedReport.status.toUpperCase()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      generatedReport.severity === 'P1' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      Severity: {generatedReport.severity}
                    </span>
                  </div>

                  {/* Summary / Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-gray-900/50 p-3 rounded-xl border border-gray-800 print:border-black">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-gray-500">Duration</span>
                      <span className="font-bold font-mono text-white print:text-black">{generatedReport.impact.durationMinutes} minutes</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-gray-500">Impacted Users</span>
                      <span className="font-bold font-mono text-white print:text-black">{generatedReport.impact.usersAffected}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-gray-500">Revenue Impact</span>
                      <span className="font-bold font-mono text-white print:text-black">{generatedReport.impact.revenueImpact}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-gray-500">Investigator</span>
                      <span className="font-bold text-white print:text-black">{generatedReport.author}</span>
                    </div>
                  </div>

                  {/* 5 Whys Analysis Block */}
                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 print:text-black">
                      5 Whys Analysis (Root Trigger Drilling)
                    </h4>
                    <ul className="space-y-1.5 pl-5 list-decimal text-xs leading-relaxed">
                      {generatedReport.fiveWhys.map((why: string, i: number) => (
                        <li key={i}>{why}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Isolated Root Cause */}
                  <div className="border-l-2 border-red-500 bg-red-950/20 p-3 rounded-r-xl text-xs print:border-black print:bg-gray-100">
                    <span className="font-bold text-red-400 block mb-1 print:text-black uppercase text-[10px] tracking-wider">
                      Isolated Root Cause:
                    </span>
                    <p className="italic text-gray-300 print:text-black">{generatedReport.rootCause}</p>
                  </div>

                  {/* Action Items List */}
                  <div>
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 print:text-black">
                      Mitigation Actions & Long-Term Controls
                    </h4>
                    <div className="space-y-2">
                      {generatedReport.actionItems.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-900/60 p-2.5 rounded-lg border border-gray-800 text-xs">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded border-gray-800 bg-gray-950 text-cyan-500" readOnly checked={false} />
                            <span className="font-bold font-mono text-gray-400">{item.id}:</span>
                            <span className="text-gray-200">{item.title}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px]">
                            <span className="text-gray-500">({item.assignee})</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                              item.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Control Footer buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-cyan-800/30 print:hidden">
                    <button
                      onClick={handleCopyMarkdown}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Print PDF</span>
                    </button>

                    <button
                      onClick={handleSaveToStore}
                      disabled={isSaved}
                      className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold transition-all shadow-md shadow-emerald-600/20 disabled:bg-emerald-800/40 disabled:text-emerald-400"
                    >
                      {isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                      <span>{isSaved ? 'Logged to Store!' : '💾 Log to Registry'}</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* RCA Directory List */}
      <div className="space-y-4">
        <h2 className="font-bold text-white text-base">Completed Post-Mortems ({rcaReports.length})</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rcaReports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-md hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    report.severity === 'P1' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {report.severity}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-400">{report.id}</span>
                </div>
                {report.status === 'reviewed' ? (
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>APPROVED</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs font-bold text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>AWAITING SIGN-OFF</span>
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-white text-sm">{report.title}</h3>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{report.summary}</p>
              </div>

              {/* Impact stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-gray-800 bg-gray-950/60 p-2.5 text-[11px]">
                <div>
                  <span className="block text-gray-500 text-[9px]">DOWNTIME</span>
                  <span className="font-bold text-gray-200">{report.impact.durationMinutes} mins</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[9px]">USERS AFFECTED</span>
                  <span className="font-bold text-gray-200">{report.impact.usersAffected}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[9px]">ACTION ITEMS</span>
                  <span className="font-bold text-gray-200">{report.actionItems.length} Tasks</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-800/60 text-xs">
                <button
                  onClick={() => setSelectedIncidentForForm((allIncidents || incidents).find(i => i.id === report.incidentId || i.id === report.incidentId.replace('RCA-', 'PRO-') || i.id === report.incidentId.replace('RCA-', 'INC-')) || { id: report.incidentId, title: report.title })}
                  className="flex items-center space-x-1 font-semibold text-cyan-400 hover:underline"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Compliance IOF Form</span>
                </button>
                <Link
                  href={`/incidents/${report.incidentId}`}
                  className="flex items-center space-x-1 font-semibold text-red-400 hover:underline"
                >
                  <span>View Post-Mortem</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {activeView === 'tasks' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* TODO Column */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                  <span className="font-black text-gray-300 text-xs uppercase tracking-wider">Backlog / Todo</span>
                </div>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-bold text-gray-400 font-mono">
                  {todoTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {todoTasks.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-8 text-center bg-gray-950/20 border border-dashed border-gray-800 rounded-xl">No tasks in backlog.</p>
                ) : (
                  todoTasks.map(task => (
                    <div key={task.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">{task.id}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs mt-1.5 leading-snug">{task.title}</h4>
                      </div>
                      
                      <div className="text-[10px] text-gray-400 space-y-1 bg-gray-900/40 p-2 rounded-lg">
                        <p className="line-clamp-1"><span className="text-gray-500">RCA:</span> {task.reportTitle}</p>
                        <p><span className="text-gray-500">Owner:</span> <strong className="text-gray-300 font-semibold">{task.assignee}</strong></p>
                      </div>

                      <div className="pt-2 border-t border-gray-800/60 flex justify-end">
                        <button
                          onClick={() => updateRcaActionItemStatus(task.reportId, task.id, 'in_progress')}
                          className="px-3 py-1 rounded bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20 border border-cyan-500/20 text-[10px] font-bold tracking-wider uppercase transition-all"
                        >
                          ⚡ Start Task →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* IN PROGRESS Column */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="font-black text-cyan-300 text-xs uppercase tracking-wider">In Progress</span>
                </div>
                <span className="rounded-full bg-cyan-950 border border-cyan-900/60 px-2 py-0.5 text-xs font-bold text-cyan-400 font-mono">
                  {inProgressTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {inProgressTasks.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-8 text-center bg-gray-950/20 border border-dashed border-gray-800 rounded-xl">No active tasks in progress.</p>
                ) : (
                  inProgressTasks.map(task => (
                    <div key={task.id} className="rounded-xl border border-cyan-500/20 bg-gray-950 p-4 space-y-3 shadow-md shadow-cyan-500/5">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">{task.id}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs mt-1.5 leading-snug">{task.title}</h4>
                      </div>
                      
                      <div className="text-[10px] text-gray-400 space-y-1 bg-gray-900/40 p-2 rounded-lg">
                        <p className="line-clamp-1"><span className="text-gray-500">RCA:</span> {task.reportTitle}</p>
                        <p><span className="text-gray-500">Owner:</span> <strong className="text-gray-300 font-semibold">{task.assignee}</strong></p>
                      </div>

                      <div className="pt-2 border-t border-gray-800/60 flex justify-between gap-2">
                        <button
                          onClick={() => updateRcaActionItemStatus(task.reportId, task.id, 'todo')}
                          className="px-2.5 py-1 rounded hover:bg-gray-900 text-gray-400 text-[10px] font-bold tracking-wider uppercase transition-all"
                        >
                          ↩ Defer
                        </button>
                        <button
                          onClick={() => updateRcaActionItemStatus(task.reportId, task.id, 'completed')}
                          className="px-3 py-1 rounded bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase transition-all"
                        >
                          ✓ Complete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COMPLETED Column */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="font-black text-emerald-300 text-xs uppercase tracking-wider">Completed</span>
                </div>
                <span className="rounded-full bg-emerald-950 border border-emerald-900/60 px-2 py-0.5 text-xs font-bold text-emerald-400 font-mono">
                  {completedTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-8 text-center bg-gray-950/20 border border-dashed border-gray-800 rounded-xl">No tasks completed yet.</p>
                ) : (
                  completedTasks.map(task => (
                    <div key={task.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-3 opacity-70 hover:opacity-100 transition-opacity">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-gray-500 font-bold uppercase line-through">{task.id}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase">
                            COMPLETED
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-300 text-xs mt-1.5 leading-snug line-through">{task.title}</h4>
                      </div>
                      
                      <div className="text-[10px] text-gray-400 space-y-1 bg-gray-900/40 p-2 rounded-lg">
                        <p className="line-clamp-1"><span className="text-gray-500">RCA:</span> {task.reportTitle}</p>
                        <p><span className="text-gray-500">Owner:</span> <strong className="text-gray-300 font-semibold">{task.assignee}</strong></p>
                      </div>

                      <div className="pt-2 border-t border-gray-800/60 flex justify-start">
                        <button
                          onClick={() => updateRcaActionItemStatus(task.reportId, task.id, 'in_progress')}
                          className="px-2.5 py-1 rounded hover:bg-gray-900 text-gray-400 text-[10px] font-bold tracking-wider uppercase transition-all"
                        >
                          ↩ Reopen Task
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {selectedIncidentForForm && (
        <IncidentOccurrenceFormModal 
          incident={selectedIncidentForForm} 
          onClose={() => setSelectedIncidentForForm(null)} 
        />
      )}

    </div>
  );
}
