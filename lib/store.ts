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

export function useIncidentStore() {
  const [organizations, setOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [activeOrgId, setActiveOrgId] = useState<string>('org-protiviti-in');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [rawIncidents, setIncidents] = useState<Incident[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<Record<string, TimelineEvent[]>>({});
  const [warRoomMessages, setWarRoomMessages] = useState<Record<string, WarRoomMessage[]>>({});
  const [rawShifts, setShifts] = useState<OnCallShift[]>([]);
  const [rawRcaReports, setRcaReports] = useState<RcaReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage or mockData
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setIncidents(parsed.incidents || INITIAL_INCIDENTS);
        setTimelineEvents(parsed.timelineEvents || INITIAL_TIMELINE_EVENTS);
        setWarRoomMessages(parsed.warRoomMessages || INITIAL_WAR_ROOM_MESSAGES);
        setShifts(parsed.shifts || INITIAL_ON_CALL_SHIFTS);
        setRcaReports(parsed.rcaReports || INITIAL_RCA_REPORTS);
        setNotifications(parsed.notifications || []);
        setUsers(parsed.users || MOCK_USERS);
      } else {
        setIncidents(INITIAL_INCIDENTS);
        setTimelineEvents(INITIAL_TIMELINE_EVENTS);
        setWarRoomMessages(INITIAL_WAR_ROOM_MESSAGES);
        setShifts(INITIAL_ON_CALL_SHIFTS);
        setRcaReports(INITIAL_RCA_REPORTS);
        setUsers(MOCK_USERS);
      }
    } catch (e) {
      console.error('Failed to load storage state:', e);
      setIncidents(INITIAL_INCIDENTS);
      setTimelineEvents(INITIAL_TIMELINE_EVENTS);
      setWarRoomMessages(INITIAL_WAR_ROOM_MESSAGES);
      setShifts(INITIAL_ON_CALL_SHIFTS);
      setRcaReports(INITIAL_RCA_REPORTS);
      setUsers(MOCK_USERS);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        incidents: rawIncidents,
        timelineEvents,
        warRoomMessages,
        shifts: rawShifts,
        rcaReports: rawRcaReports,
        notifications,
        users
      }));
    } catch (e) {
      console.error('Failed to save storage state:', e);
    }
  }, [rawIncidents, timelineEvents, warRoomMessages, rawShifts, rawRcaReports, notifications, users, isLoaded]);

  // Periodic SLA Breach Checker
  useEffect(() => {
    const interval = setInterval(() => {
      setIncidents(prev => prev.map(inc => {
        if (inc.status === 'resolved') return inc;
        
        let ttaBreached = inc.ttaBreached;
        let ttrBreached = inc.ttrBreached;

        if (inc.status === 'triggered' && !ttaBreached) {
          const { isBreached } = getTimeRemaining(inc.ttaDeadline);
          if (isBreached) ttaBreached = true;
        }

        if (!ttrBreached) {
          const { isBreached } = getTimeRemaining(inc.ttrDeadline);
          if (isBreached) ttrBreached = true;
        }

        if (ttaBreached !== inc.ttaBreached || ttrBreached !== inc.ttrBreached) {
          return { ...inc, ttaBreached, ttrBreached };
        }
        return inc;
      }));
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
    setNotifications(prev => [newNotif, ...prev]);
  };

  const activeOrganization = organizations.find(o => o.id === activeOrgId) || organizations[0];

  const updateOrganizationSla = (orgId: string, newSlaSettings: SLAConfig) => {
    setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, slaSettings: newSlaSettings } : o));
  };

  const incidents = activeOrgId === 'ALL' ? rawIncidents : rawIncidents.filter(i => i.organizationId === activeOrgId);
  const shifts = activeOrgId === 'ALL' ? rawShifts : rawShifts.filter(s => s.organizationId === activeOrgId);
  const rcaReports = activeOrgId === 'ALL' ? rawRcaReports : rawRcaReports.filter(r => r.organizationId === activeOrgId);

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
    const orgId = activeOrgId === 'ALL' ? organizations[0].id : activeOrgId;

    const { ttaDeadline, ttrDeadline } = calculateSLADeadlines(createdAt, data.severity);

    // Pick responder based on service shift
    const matchingShift = rawShifts.find(s => s.service === data.service && s.organizationId === orgId) || rawShifts[0];
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

    setIncidents(prev => [newIncident, ...prev]);
    setTimelineEvents(prev => ({ ...prev, [id]: [initialEvent] }));
    setWarRoomMessages(prev => ({ ...prev, [id]: [initialMessage] }));

    dispatchNotification(id, assignedTo, 'SMS', `[URGENT ${data.severity}] ${id}: ${data.title}. Acknowledge at: https://ops.company.internal/incidents/${id}`);
    if (data.severity === 'P1') {
      dispatchNotification(id, assignedTo, 'VOICE_CALL', `P1 Critical Alert triggered for ${data.service}. Immediate acknowledgement required.`);
    }

    return newIncident;
  };

  // Acknowledge Incident
  const acknowledgeIncident = (incidentId: string, responderName?: string) => {
    const ackTime = new Date().toISOString();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'acknowledged',
          acknowledgedAt: ackTime,
        };
      }
      return inc;
    }));

    const author = responderName || 'On-Call Responder';
    const event: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId,
      timestamp: ackTime,
      type: 'status_change',
      author,
      content: `Acknowledged incident by ${author}. SLA TTA timer stopped.`,
    };

    setTimelineEvents(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), event],
    }));
  };

  // Update Status
  const updateIncidentStatus = (incidentId: string, newStatus: IncidentStatus, authorName: string) => {
    const updateTime = new Date().toISOString();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const isResolving = newStatus === 'resolved';
        return {
          ...inc,
          status: newStatus,
          resolvedAt: isResolving ? updateTime : inc.resolvedAt,
        };
      }
      return inc;
    }));

    const event: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId,
      timestamp: updateTime,
      type: 'status_change',
      author: authorName,
      content: `Changed incident status to ${newStatus.toUpperCase()}.`,
    };

    setTimelineEvents(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), event],
    }));

    const systemMsg: WarRoomMessage = {
      id: `wm-${Date.now()}`,
      incidentId,
      sender: { name: 'Incident Controller', avatar: '/bot-avatar.png', role: 'System' },
      message: `Status updated to **${newStatus.toUpperCase()}** by ${authorName}.`,
      timestamp: updateTime,
      isSystem: true,
    };

    setWarRoomMessages(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), systemMsg],
    }));
  };

  // Reassign Responder
  const reassignResponder = (incidentId: string, newResponder: Responder, authorName: string) => {
    const updateTime = new Date().toISOString();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return { ...inc, assignedTo: newResponder };
      }
      return inc;
    }));

    const event: TimelineEvent = {
      id: `te-${Date.now()}`,
      incidentId,
      timestamp: updateTime,
      type: 'responder_assigned',
      author: authorName,
      content: `Reassigned incident commander to ${newResponder.name} (${newResponder.role}).`,
    };

    setTimelineEvents(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), event],
    }));

    dispatchNotification(incidentId, newResponder, 'SMS', `[Reassigned] You are now primary commander for ${incidentId}.`);
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

    setWarRoomMessages(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), newMsg],
    }));
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

    setTimelineEvents(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), newEvent],
    }));
  };

  // Create or Update RCA Report
  const saveRcaReport = (report: RcaReport) => {
    setRcaReports(prev => {
      const idx = prev.findIndex(r => r.id === report.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = report;
        return copy;
      }
      return [report, ...prev];
    });

    // Link RCA to Incident
    setIncidents(prev => prev.map(inc => {
      if (inc.id === report.incidentId) {
        return { ...inc, rcaId: report.id };
      }
      return inc;
    }));
  };

  // Reset to default mock data
  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOrganizations(MOCK_ORGANIZATIONS);
    setActiveOrgId('org-protiviti-in');
    setIncidents(INITIAL_INCIDENTS);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setWarRoomMessages(INITIAL_WAR_ROOM_MESSAGES);
    setShifts(INITIAL_ON_CALL_SHIFTS);
    setRcaReports(INITIAL_RCA_REPORTS);
    setNotifications([]);
  };
  // Login Handler
  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setActiveOrgId(user.organizationId);
      const payload = {
        sub: user.id,
        email: user.email,
        orgId: user.organizationId,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.sig`;
      setJwtToken(token);
      return token;
    }
    return null;
  };

  // Logout Handler
  const logout = () => {
    setCurrentUser(null);
    setJwtToken(null);
  };

  // Create On Call Shift Rotation
  const createOnCallShift = (shift: OnCallShift) => {
    setShifts(prev => [...prev, shift]);
  };

  // SLA Stress & Chaos Simulation
  const simulateSlaAnomalies = (type: 'traffic' | 'breach' | 'reset') => {
    if (type === 'reset') {
      resetToDefault();
      return;
    }

    const orgId = activeOrgId === 'ALL' ? 'org-protiviti-in' : activeOrgId;
    const matchingShift = rawShifts.find(s => s.organizationId === orgId) || rawShifts[0];

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

      setIncidents(prev => [newInc, ...prev]);
    } else if (type === 'breach') {
      // Create an incident that was triggered 45 minutes ago to force TTA & TTR breaches
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

      setIncidents(prev => [newInc, ...prev]);
    }
  };

  const addUser = (newUser: User) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newUser;
        return copy;
      }
      return [...prev, newUser];
    });
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return {
    isLoaded,
    currentUser,
    jwtToken,
    login,
    logout,
    organizations,
    activeOrgId,
    activeOrganization,
    setActiveOrgId,
    updateOrganizationSla,
    incidents,
    allIncidents: rawIncidents,
    timelineEvents,
    warRoomMessages,
    shifts,
    allShifts: rawShifts,
    rcaReports,
    allRcaReports: rawRcaReports,
    notifications,
    users,
    createIncident,
    acknowledgeIncident,
    updateIncidentStatus,
    reassignResponder,
    addWarRoomMessage,
    addTimelineNote,
    saveRcaReport,
    createOnCallShift,
    simulateSlaAnomalies,
    resetToDefault,
    addUser,
    removeUser,
  };
}
