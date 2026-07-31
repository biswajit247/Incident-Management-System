'use client';

import { useState, useEffect } from 'react';
import { Incident, IncidentStatus, OnCallShift, Organization, RcaReport, Responder, Severity, SLAConfig, TimelineEvent, User, WarRoomMessage } from './types';
import { 
  INITIAL_INCIDENTS, 
  INITIAL_TIMELINE_EVENTS, 
  INITIAL_WAR_ROOM_MESSAGES, 
  INITIAL_ON_CALL_SHIFTS, 
  INITIAL_RCA_REPORTS, 
  MOCK_RESPONDERS,
  MOCK_ORGANIZATIONS,
  MOCK_USERS 
} from './mockData';
import { calculateSLADeadlines, getTimeRemaining } from './slaUtils';

export interface NotificationLog {
  id: string;
  incidentId: string;
  recipientName: string;
  recipientPhone: string;
  channel: 'SMS' | 'VOICE_CALL' | 'PUSH_NOTIFICATION' | 'SLACK';
  message: string;
  timestamp: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
}

const STORAGE_KEY = 'incident_system_state_v6';

// Global shared state storage object to prevent desynchronization
let globalState = {
  organizations: MOCK_ORGANIZATIONS,
  activeOrgId: 'org-protiviti-in',
  currentUser: null as User | null,
  jwtToken: null as string | null,
  users: [] as User[],
  rawIncidents: [] as Incident[],
  timelineEvents: {} as Record<string, TimelineEvent[]>,
  warRoomMessages: {} as Record<string, WarRoomMessage[]>,
  rawShifts: [] as OnCallShift[],
  rawRcaReports: [] as RcaReport[],
  notifications: [] as NotificationLog[],
  isLoaded: false,
};

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(l => l());
};

const saveToLocalStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      incidents: globalState.rawIncidents,
      timelineEvents: globalState.timelineEvents,
      warRoomMessages: globalState.warRoomMessages,
      shifts: globalState.rawShifts,
      rcaReports: globalState.rawRcaReports,
      notifications: globalState.notifications,
      users: globalState.users,
      activeOrgId: globalState.activeOrgId,
      currentUser: globalState.currentUser,
      jwtToken: globalState.jwtToken,
      organizations: globalState.organizations,
    }));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export function useIncidentStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const forceUpdate = () => setTick(t => t + 1);
    listeners.add(forceUpdate);
    
    // Load from LocalStorage once
    if (!globalState.isLoaded && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          globalState.rawIncidents = parsed.incidents || INITIAL_INCIDENTS;
          globalState.timelineEvents = parsed.timelineEvents || INITIAL_TIMELINE_EVENTS;
          globalState.warRoomMessages = parsed.warRoomMessages || INITIAL_WAR_ROOM_MESSAGES;
          globalState.rawShifts = parsed.shifts || INITIAL_ON_CALL_SHIFTS;
          globalState.rawRcaReports = parsed.rcaReports || INITIAL_RCA_REPORTS;
          globalState.notifications = parsed.notifications || [];
          globalState.users = parsed.users || MOCK_USERS;
          globalState.activeOrgId = parsed.activeOrgId || 'org-protiviti-in';
          globalState.currentUser = parsed.currentUser || null;
          globalState.jwtToken = parsed.jwtToken || null;
          globalState.organizations = parsed.organizations || MOCK_ORGANIZATIONS;
        } else {
          globalState.rawIncidents = INITIAL_INCIDENTS;
          globalState.timelineEvents = INITIAL_TIMELINE_EVENTS;
          globalState.warRoomMessages = INITIAL_WAR_ROOM_MESSAGES;
          globalState.rawShifts = INITIAL_ON_CALL_SHIFTS;
          globalState.rawRcaReports = INITIAL_RCA_REPORTS;
          globalState.users = MOCK_USERS;
        }
      } catch (e) {
        console.error('Failed to load state:', e);
        globalState.rawIncidents = INITIAL_INCIDENTS;
        globalState.timelineEvents = INITIAL_TIMELINE_EVENTS;
        globalState.warRoomMessages = INITIAL_WAR_ROOM_MESSAGES;
        globalState.rawShifts = INITIAL_ON_CALL_SHIFTS;
        globalState.rawRcaReports = INITIAL_RCA_REPORTS;
        globalState.users = MOCK_USERS;
      }
      globalState.isLoaded = true;
      notify();
    }

    return () => {
      listeners.delete(forceUpdate);
    };
  }, []);

  // Periodic SLA Breach Checker
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const updated = globalState.rawIncidents.map(inc => {
        if (inc.status === 'resolved') return inc;
        
        let ttaBreached = inc.ttaBreached;
        let ttrBreached = inc.ttrBreached;

        if (inc.status === 'triggered' && !ttaBreached) {
          const { isBreached } = getTimeRemaining(inc.ttaDeadline);
          if (isBreached) {
            ttaBreached = true;
            changed = true;
          }
        }

        if (!ttrBreached) {
          const { isBreached } = getTimeRemaining(inc.ttrDeadline);
          if (isBreached) {
            ttrBreached = true;
            changed = true;
          }
        }

        if (ttaBreached !== inc.ttaBreached || ttrBreached !== inc.ttrBreached) {
          return { ...inc, ttaBreached, ttrBreached };
        }
        return inc;
      });

      if (changed) {
        globalState.rawIncidents = updated;
        saveToLocalStorage();
        notify();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Dispatch Notification simulation
  const dispatchNotification = (incidentId: string, recipient: typeof MOCK_RESPONDERS[0], channel: 'SMS' | 'VOICE_CALL' | 'PUSH_NOTIFICATION' | 'SLACK', msg: string) => {
    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      incidentId,
      recipientName: recipient.name,
      recipientPhone: recipient.phone,
      channel,
      message: msg,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
    };
    globalState.notifications = [newNotif, ...globalState.notifications];
    saveToLocalStorage();
    notify();
  };

  const activeOrganization = globalState.organizations.find(o => o.id === globalState.activeOrgId) || globalState.organizations[0];

  const updateOrganizationSla = (orgId: string, newSlaSettings: SLAConfig) => {
    globalState.organizations = globalState.organizations.map(o => o.id === orgId ? { ...o, slaSettings: newSlaSettings } : o);
    saveToLocalStorage();
    notify();
  };

  const updateOrganization = (orgId: string, updates: Partial<Organization>) => {
    globalState.organizations = globalState.organizations.map(o => o.id === orgId ? { ...o, ...updates } : o);
    saveToLocalStorage();
    notify();
  };

  const incidents = globalState.activeOrgId === 'ALL' ? globalState.rawIncidents : globalState.rawIncidents.filter(i => i.organizationId === globalState.activeOrgId);
  const shifts = globalState.activeOrgId === 'ALL' ? globalState.rawShifts : globalState.rawShifts.filter(s => s.organizationId === globalState.activeOrgId);
  const rcaReports = globalState.activeOrgId === 'ALL' ? globalState.rawRcaReports : globalState.rawRcaReports.filter(r => r.organizationId === globalState.activeOrgId);

  // Add Incident
  const createIncident = (data: {
    title: string;
    description: string;
    severity: Severity;
    service: string;
    source: Incident['source'];
    tags?: string[];
  }) => {
    const createdAt = new Date().toISOString();
    const prefix = activeOrganization.prefix || 'PRO';
    const id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orgId = globalState.activeOrgId === 'ALL' ? globalState.organizations[0].id : globalState.activeOrgId;

    const { ttaDeadline, ttrDeadline } = calculateSLADeadlines(createdAt, data.severity);

    // Pick responder based on service shift
    const matchingShift = globalState.rawShifts.find(s => s.service === data.service && s.organizationId === orgId) || globalState.rawShifts[0];
    const assignedTo = matchingShift.tier1;

    const newIncident: Incident = {
      id,
      organizationId: orgId,
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: 'triggered',
      service: data.service,
      createdAt,
      assignedTo,
      ttaDeadline,
      ttrDeadline,
      ttaBreached: false,
      ttrBreached: false,
      source: data.source,
      warRoomUrl: `https://warroom.company.internal/${id}`,
      videoBridgeUrl: `https://meet.jit.si/Incident-Command-${id}`,
      tags: data.tags || [data.service.toLowerCase().replace(/\s+/g, '-'), data.severity.toLowerCase()],
    };

    const initialEvent: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId: id,
      timestamp: createdAt,
      type: 'alert_ingested',
      author: `${data.source.toUpperCase()} Monitor`,
      content: `Alert auto-generated: ${data.title}`,
    };

    const initialMessage: WarRoomMessage = {
      id: `wm-${Date.now()}`,
      incidentId: id,
      sender: { name: 'Sentinel Alert Engine', avatar: '/bot-avatar.png', role: 'Automation Engine' },
      message: `🚨 Emergency Incident ${id} created [${data.severity}]. On-Call responder ${assignedTo.name} paged via SMS & Voice.`,
      timestamp: createdAt,
      isSystem: true,
    };

    globalState.rawIncidents = [newIncident, ...globalState.rawIncidents];
    globalState.timelineEvents = { ...globalState.timelineEvents, [id]: [initialEvent] };
    globalState.warRoomMessages = { ...globalState.warRoomMessages, [id]: [initialMessage] };

    dispatchNotification(id, assignedTo, 'SMS', `[URGENT ${data.severity}] ${id}: ${data.title}. Acknowledge at: https://ops.company.internal/incidents/${id}`);
    if (data.severity === 'P1') {
      dispatchNotification(id, assignedTo, 'VOICE_CALL', `P1 Critical Alert triggered for ${data.service}. Immediate acknowledgement required.`);
    }

    saveToLocalStorage();
    notify();
    return newIncident;
  };

  // Acknowledge Incident
  const acknowledgeIncident = (incidentId: string, responderName?: string) => {
    const ackTime = new Date().toISOString();
    globalState.rawIncidents = globalState.rawIncidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'acknowledged',
          acknowledgedAt: ackTime,
        };
      }
      return inc;
    });

    const author = responderName || 'On-Call Responder';
    const event: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId,
      timestamp: ackTime,
      type: 'status_change',
      author,
      content: `Acknowledged incident by ${author}. SLA TTA timer stopped.`,
    };

    globalState.timelineEvents = {
      ...globalState.timelineEvents,
      [incidentId]: [...(globalState.timelineEvents[incidentId] || []), event],
    };

    saveToLocalStorage();
    notify();
  };

  // Update Status
  const updateIncidentStatus = (incidentId: string, newStatus: IncidentStatus, authorName: string) => {
    const updateTime = new Date().toISOString();
    globalState.rawIncidents = globalState.rawIncidents.map(inc => {
      if (inc.id === incidentId) {
        const isResolving = newStatus === 'resolved';
        return {
          ...inc,
          status: newStatus,
          resolvedAt: isResolving ? updateTime : inc.resolvedAt,
        };
      }
      return inc;
    });

    const event: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId,
      timestamp: updateTime,
      type: 'status_change',
      author: authorName,
      content: `Changed incident status to ${newStatus.toUpperCase()}.`,
    };

    globalState.timelineEvents = {
      ...globalState.timelineEvents,
      [incidentId]: [...(globalState.timelineEvents[incidentId] || []), event],
    };

    const systemMsg: WarRoomMessage = {
      id: `wm-${Date.now()}`,
      incidentId,
      sender: { name: 'Incident Controller', avatar: '/bot-avatar.png', role: 'System' },
      message: `Status updated to **${newStatus.toUpperCase()}** by ${authorName}.`,
      timestamp: updateTime,
      isSystem: true,
    };

    globalState.warRoomMessages = {
      ...globalState.warRoomMessages,
      [incidentId]: [...(globalState.warRoomMessages[incidentId] || []), systemMsg],
    };

    saveToLocalStorage();
    notify();
  };

  // Reassign Responder
  const reassignResponder = (incidentId: string, newResponder: Responder, authorName: string) => {
    const updateTime = new Date().toISOString();
    globalState.rawIncidents = globalState.rawIncidents.map(inc => {
      if (inc.id === incidentId) {
        return { ...inc, assignedTo: newResponder };
      }
      return inc;
    });

    const event: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId,
      timestamp: updateTime,
      type: 'responder_assigned',
      author: authorName,
      content: `Reassigned incident commander to ${newResponder.name} (${newResponder.role}).`,
    };

    globalState.timelineEvents = {
      ...globalState.timelineEvents,
      [incidentId]: [...(globalState.timelineEvents[incidentId] || []), event],
    };

    saveToLocalStorage();
    dispatchNotification(incidentId, newResponder, 'SMS', `[Reassigned] You are now primary commander for ${incidentId}.`);
    notify();
  };

  // Add War Room Message
  const addWarRoomMessage = (incidentId: string, sender: WarRoomMessage['sender'], text: string) => {
    const timestamp = new Date().toISOString();
    const newMsg: WarRoomMessage = {
      id: `wm-${Date.now()}`,
      incidentId,
      sender,
      message: text,
      timestamp,
    };

    globalState.warRoomMessages = {
      ...globalState.warRoomMessages,
      [incidentId]: [...(globalState.warRoomMessages[incidentId] || []), newMsg],
    };

    saveToLocalStorage();
    notify();
  };

  // Add Timeline Note
  const addTimelineNote = (incidentId: string, author: string, note: string) => {
    const timestamp = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId,
      timestamp,
      type: 'note_added',
      author,
      content: note,
    };

    globalState.timelineEvents = {
      ...globalState.timelineEvents,
      [incidentId]: [...(globalState.timelineEvents[incidentId] || []), newEvent],
    };

    saveToLocalStorage();
    notify();
  };

  // Create or Update RCA Report
  const saveRcaReport = (report: RcaReport) => {
    const idx = globalState.rawRcaReports.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      globalState.rawRcaReports[idx] = report;
    } else {
      globalState.rawRcaReports = [report, ...globalState.rawRcaReports];
    }

    // Link RCA to Incident
    globalState.rawIncidents = globalState.rawIncidents.map(inc => {
      if (inc.id === report.incidentId) {
        return { ...inc, rcaId: report.id };
      }
      return inc;
    });

    saveToLocalStorage();
    notify();
  };

  // Update RCA Action Item Status
  const updateRcaActionItemStatus = (reportId: string, actionItemId: string, status: 'todo' | 'in_progress' | 'completed') => {
    globalState.rawRcaReports = globalState.rawRcaReports.map(report => {
      if (report.id === reportId) {
        const updatedActionItems = report.actionItems.map(item => {
          if (item.id === actionItemId) {
            return { ...item, status };
          }
          return item;
        });
        return { ...report, actionItems: updatedActionItems };
      }
      return report;
    });

    saveToLocalStorage();
    notify();
  };

  // Reset to default mock data
  const resetToDefault = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    globalState.organizations = MOCK_ORGANIZATIONS;
    globalState.activeOrgId = 'org-protiviti-in';
    globalState.currentUser = null;
    globalState.jwtToken = null;
    globalState.users = MOCK_USERS;
    globalState.rawIncidents = INITIAL_INCIDENTS;
    globalState.timelineEvents = INITIAL_TIMELINE_EVENTS;
    globalState.warRoomMessages = INITIAL_WAR_ROOM_MESSAGES;
    globalState.rawShifts = INITIAL_ON_CALL_SHIFTS;
    globalState.rawRcaReports = INITIAL_RCA_REPORTS;
    globalState.notifications = [];
    
    saveToLocalStorage();
    notify();
  };

  // Login Handler
  const login = (email: string, pass: string) => {
    const user = globalState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      globalState.currentUser = user;
      globalState.activeOrgId = user.organizationId;
      const payload = {
        sub: user.id,
        email: user.email,
        orgId: user.organizationId,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.sig`;
      globalState.jwtToken = token;
      
      saveToLocalStorage();
      notify();
      return token;
    }
    return null;
  };

  // Logout Handler
  const logout = () => {
    globalState.currentUser = null;
    globalState.jwtToken = null;
    saveToLocalStorage();
    notify();
  };

  // Create On Call Shift Rotation
  const createOnCallShift = (shift: OnCallShift) => {
    globalState.rawShifts = [...globalState.rawShifts, shift];
    saveToLocalStorage();
    notify();
  };

  // SLA Stress & Chaos Simulation
  const simulateSlaAnomalies = (type: 'traffic' | 'breach' | 'reset') => {
    if (type === 'reset') {
      resetToDefault();
      return;
    }

    const orgId = globalState.activeOrgId === 'ALL' ? 'org-protiviti-in' : globalState.activeOrgId;
    const matchingShift = globalState.rawShifts.find(s => s.organizationId === orgId) || globalState.rawShifts[0];

    if (type === 'traffic') {
      const createdAt = new Date().toISOString();
      const id = `PRO-CHAOS-${Math.floor(1000 + Math.random() * 9000)}`;
      const { ttaDeadline, ttrDeadline } = calculateSLADeadlines(createdAt, 'P1');
      const newInc: Incident = {
        id,
        organizationId: orgId,
        title: 'CHAOS INJECTION: Simulated Production Database High Write Lock Saturation',
        description: 'Chaos Engineering Test: Synthetic traffic surge. postgres_pg_stat_database_numbackends = 998. Write transactions locked.',
        severity: 'P1',
        status: 'triggered',
        service: 'Platform & DB',
        createdAt,
        assignedTo: matchingShift.tier1,
        ttaDeadline,
        ttrDeadline,
        ttaBreached: false,
        ttrBreached: false,
        source: 'prometheus',
        tags: ['chaos-test', 'load-surge', 'active-lock'],
        affectedMetrics: {
          cpu: '99%',
          latencyP99: '14,800 ms',
          errorRate: '12.4%',
        }
      };

      globalState.rawIncidents = [newInc, ...globalState.rawIncidents];
    } else if (type === 'breach') {
      const createdAt = new Date(Date.now() - 45 * 60 * 1000).toISOString();
      const id = `PRO-BREACH-${Math.floor(1000 + Math.random() * 9000)}`;
      const { ttaDeadline, ttrDeadline } = calculateSLADeadlines(createdAt, 'P1');
      const newInc: Incident = {
        id,
        organizationId: orgId,
        title: 'SLA BREACH SIMULATION: Microservice API Route Gateway Timeout (504)',
        description: 'SLA Stress Test: Simulated unacknowledged incident past 5-minute MTTA and 30-minute MTTR escalation limits.',
        severity: 'P1',
        status: 'triggered',
        service: 'Platform & DB',
        createdAt,
        assignedTo: matchingShift.tier1,
        ttaDeadline,
        ttrDeadline,
        ttaBreached: true,
        ttrBreached: true,
        source: 'cloudwatch',
        tags: ['sla-breach', 'sla-test', 'timeout-escalation'],
      };

      globalState.rawIncidents = [newInc, ...globalState.rawIncidents];
    }
    saveToLocalStorage();
    notify();
  };

  const addUser = (newUser: User) => {
    const idx = globalState.users.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (idx >= 0) {
      globalState.users[idx] = newUser;
    } else {
      globalState.users = [...globalState.users, newUser];
    }
    saveToLocalStorage();
    notify();
  };

  const removeUser = (userId: string) => {
    globalState.users = globalState.users.filter(u => u.id !== userId);
    saveToLocalStorage();
    notify();
  };

  const setActiveOrgId = (orgId: string) => {
    globalState.activeOrgId = orgId;
    saveToLocalStorage();
    notify();
  };

  return {
    isLoaded: globalState.isLoaded,
    currentUser: globalState.currentUser,
    jwtToken: globalState.jwtToken,
    login,
    logout,
    organizations: globalState.organizations,
    activeOrgId: globalState.activeOrgId,
    activeOrganization,
    setActiveOrgId,
    updateOrganizationSla,
    updateOrganization,
    incidents,
    allIncidents: globalState.rawIncidents,
    timelineEvents: globalState.timelineEvents,
    warRoomMessages: globalState.warRoomMessages,
    shifts,
    allShifts: globalState.rawShifts,
    rcaReports: globalState.rawRcaReports,
    allRcaReports: globalState.rawRcaReports,
    notifications: globalState.notifications,
    users: globalState.users,
    createIncident,
    acknowledgeIncident,
    updateIncidentStatus,
    reassignResponder,
    addWarRoomMessage,
    addTimelineNote,
    saveRcaReport,
    updateRcaActionItemStatus,
    createOnCallShift,
    simulateSlaAnomalies,
    resetToDefault,
    addUser,
    removeUser,
  };
}
