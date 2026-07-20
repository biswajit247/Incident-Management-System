export type Severity = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus = 
  | 'triggered' 
  | 'acknowledged' 
  | 'investigating' 
  | 'identified' 
  | 'monitoring' 
  | 'resolved';

export type IncidentSource = 'datadog' | 'prometheus' | 'user' | 'webhook' | 'api' | 'cloudwatch';

export interface Responder {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  phone: string;
  team: string;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  prefix: string;
  logoUrl?: string;
  badgeColor: string;
  slaSettings: SLAConfig;
  createdAt: string;
}

export interface Incident {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  service: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo: Responder;
  ttaDeadline: string;
  ttrDeadline: string;
  ttaBreached: boolean;
  ttrBreached: boolean;
  source: IncidentSource;
  warRoomUrl?: string;
  videoBridgeUrl?: string;
  rcaId?: string;
  tags: string[];
  affectedMetrics?: {
    cpu?: string;
    errorRate?: string;
    latencyP99?: string;
  };
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  type: 'status_change' | 'alert_ingested' | 'escalation' | 'note_added' | 'responder_assigned' | 'rca_created';
  author: string;
  content: string;
  badgeColor?: string;
}

export interface WarRoomMessage {
  id: string;
  incidentId: string;
  sender: {
    name: string;
    avatar: string;
    role: string;
  };
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface OnCallShift {
  id: string;
  organizationId: string;
  teamName: string;
  service: string;
  tier1: Responder;
  tier2: Responder;
  executiveEscalation: Responder;
  escalationTimeoutMins: number;
  shiftStart: string;
  shiftEnd: string;
  isHandoverPending?: boolean;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface RcaReport {
  id: string;
  incidentId: string;
  organizationId: string;
  title: string;
  severity: Severity;
  author: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  impact: {
    durationMinutes: number;
    usersAffected: number;
    affectedServices: string[];
    revenueImpact: string;
  };
  fiveWhys: string[];
  rootCause: string;
  detectionDetails: string;
  mitigationSteps: string;
  actionItems: ActionItem[];
  status: 'draft' | 'completed' | 'reviewed';
}

export interface SLAConfig {
  P1: { ttaMins: number; ttrMins: number };
  P2: { ttaMins: number; ttrMins: number };
  P3: { ttaMins: number; ttrMins: number };
  P4: { ttaMins: number; ttrMins: number };
}

export interface IncidentOccurrenceRecord {
  id: string;
  organizationId: string;
  incidentNumber: string;
  reportedDate: string;
  severityLevel: 'Level 1 (Low)' | 'Level 2 (Medium)' | 'Level 3 (High)';
  site: string;
  securityLead: string;
  contactMobile: string;
  exactLocation: string;
  description: string;
  actionsTaken: string[];
  bodyPartsInjured: string[];
  hazardTypes: string[];
  natureOfInjury: string[];
  incidentTypes: string[];
  systemFailures: string[];
  correctiveActions: string;
  shiftIcSignature: string;
  fmLeadSignature: string;
  documentVersion: string;
  createdAt: string;
}
