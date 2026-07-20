import { Incident, OnCallShift, Organization, RcaReport, Responder, TimelineEvent, User, WarRoomMessage } from './types';
import { calculateSLADeadlines } from './slaUtils';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-protiviti-in',
    name: 'Protiviti India Member Private Limited',
    subdomain: 'india.protiviti.com',
    prefix: 'PRO',
    logoUrl: '/protiviti-logo.png',
    badgeColor: '#0891b2', // Cyan
    slaSettings: {
      P1: { ttaMins: 5, ttrMins: 30 },
      P2: { ttaMins: 15, ttrMins: 120 },
      P3: { ttaMins: 60, ttrMins: 480 },
      P4: { ttaMins: 240, ttrMins: 1440 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'org-acme-fin',
    name: 'Acme Financial Systems',
    subdomain: 'fin.acme.io',
    prefix: 'ACME',
    badgeColor: '#10b981', // Emerald
    slaSettings: {
      P1: { ttaMins: 3, ttrMins: 15 },
      P2: { ttaMins: 10, ttrMins: 60 },
      P3: { ttaMins: 30, ttrMins: 240 },
      P4: { ttaMins: 120, ttrMins: 720 },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'org-nexus-cloud',
    name: 'Nexus Cloud Infrastructure',
    subdomain: 'cloud.nexus.net',
    prefix: 'NEX',
    badgeColor: '#8b5cf6', // Violet
    slaSettings: {
      P1: { ttaMins: 10, ttrMins: 60 },
      P2: { ttaMins: 30, ttrMins: 240 },
      P3: { ttaMins: 120, ttrMins: 960 },
      P4: { ttaMins: 480, ttrMins: 2880 },
    },
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-101',
    name: 'Shuvam Boral',
    email: 'shuvam@protiviti.com',
    organizationId: 'org-protiviti-in',
    role: 'SecurityLead',
    title: 'Security Shift IC Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-102',
    name: 'Rahul Lal',
    email: 'rahul.admin@protiviti.com',
    organizationId: 'org-protiviti-in',
    role: 'OrgAdmin',
    title: 'VP of Infrastructure & Security',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-103',
    name: 'Puja Dutta',
    email: 'puja@protiviti.com',
    organizationId: 'org-protiviti-in',
    role: 'Reporter',
    title: 'Facilities Operations Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-201',
    name: 'Alex Rivera',
    email: 'alex@acme.com',
    organizationId: 'org-acme-fin',
    role: 'SecurityLead',
    title: 'Staff SRE Commander',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'usr-301',
    name: 'Sarah Jenkins',
    email: 'sarah@nexus.com',
    organizationId: 'org-nexus-cloud',
    role: 'OrgAdmin',
    title: 'Chief Security Officer',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
  },
];

export const MOCK_RESPONDERS: Responder[] = [
  {
    id: 'resp-1',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    role: 'Staff SRE Lead',
    email: 'alex.rivera@company.internal',
    phone: '+1 (555) 234-8901',
    team: 'SRE Core',
  },
  {
    id: 'resp-2',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    role: 'Principal Infrastructure Eng',
    email: 'elena.r@company.internal',
    phone: '+1 (555) 892-1144',
    team: 'Platform & DB',
  },
  {
    id: 'resp-3',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    role: 'Senior Backend Lead',
    email: 'david.chen@company.internal',
    phone: '+1 (555) 431-9022',
    team: 'Payments Engine',
  },
  {
    id: 'resp-4',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'SecOps Architect',
    email: 'sarah.j@company.internal',
    phone: '+1 (555) 762-3390',
    team: 'Security & Auth',
  },
  {
    id: 'resp-5',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    role: 'DevOps Specialist',
    email: 'marcus.v@company.internal',
    phone: '+1 (555) 612-4411',
    team: 'Cloud & Kubernetes',
  },
];

const now = Date.now();
const minutesAgo = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();

const p1Sla = calculateSLADeadlines(minutesAgo(12), 'P1');
const p1_2Sla = calculateSLADeadlines(minutesAgo(45), 'P1');
const p2Sla = calculateSLADeadlines(minutesAgo(30), 'P2');
const p3Sla = calculateSLADeadlines(minutesAgo(90), 'P3');
const p4Sla = calculateSLADeadlines(minutesAgo(180), 'P4');

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'PRO-9042',
    organizationId: 'org-protiviti-in',
    title: 'Payment Gateway API 504 Timeouts on Checkout API Gateway',
    description: 'Datadog Alert: Payment Service HTTP 5xx error rate exceeded 18.5% threshold. Spike in Stripe connection pool exhaustion during peak transaction load.',
    severity: 'P1',
    status: 'investigating',
    service: 'Payments Engine',
    createdAt: minutesAgo(12),
    acknowledgedAt: minutesAgo(10),
    assignedTo: MOCK_RESPONDERS[2], // David Chen
    ttaDeadline: p1Sla.ttaDeadline,
    ttrDeadline: p1Sla.ttrDeadline,
    ttaBreached: false,
    ttrBreached: false,
    source: 'datadog',
    warRoomUrl: 'https://warroom.company.internal/PRO-9042',
    videoBridgeUrl: 'https://meet.jit.si/Incident-Command-PRO-9042',
    tags: ['stripe', 'checkout', 'p1-outage', 'connection-pool'],
    affectedMetrics: {
      errorRate: '18.5%',
      latencyP99: '4,250 ms',
      cpu: '94%',
    },
  },
  {
    id: 'PRO-9041',
    organizationId: 'org-protiviti-in',
    title: 'Production Database Primary Node High Disk I/O & Connection Saturation',
    description: 'Prometheus Alert: postgres_pg_stat_database_numbackends > 980 (Limit: 1000). Unindexed query from analytics pipeline blocking write locks on customer_sessions table.',
    severity: 'P1',
    status: 'triggered',
    service: 'Platform & DB',
    createdAt: minutesAgo(6), // 6 mins ago -> TTA 5 mins breached!
    assignedTo: MOCK_RESPONDERS[1], // Elena Rostova
    ttaDeadline: p1_2Sla.ttaDeadline,
    ttrDeadline: p1_2Sla.ttrDeadline,
    ttaBreached: true,
    ttrBreached: false,
    source: 'prometheus',
    warRoomUrl: 'https://warroom.company.internal/PRO-9041',
    videoBridgeUrl: 'https://meet.jit.si/Incident-Command-PRO-9041',
    tags: ['postgres', 'database', 'locking', 'disk-io'],
    affectedMetrics: {
      cpu: '98%',
      latencyP99: '8,900 ms',
      errorRate: '4.2%',
    },
  },
  {
    id: 'PRO-9043',
    organizationId: 'org-protiviti-in',
    title: 'Kolkata 10th Floor Server Room AC Failure & Thermal Spike',
    description: 'Security & Facilities Incident: Server room 10th Floor AC tripped causing rapid temperature rise. Technician paged on 30th Dec; AC repaired and under observation.',
    severity: 'P2',
    status: 'resolved',
    service: 'Platform & DB',
    createdAt: minutesAgo(300),
    acknowledgedAt: minutesAgo(290),
    resolvedAt: minutesAgo(60),
    assignedTo: MOCK_RESPONDERS[1], // Elena Rostova
    ttaDeadline: p2Sla.ttaDeadline,
    ttrDeadline: p2Sla.ttrDeadline,
    ttaBreached: false,
    ttrBreached: false,
    source: 'user',
    rcaId: 'RCA-9043',
    tags: ['kolkata', 'server-room', 'ac-failure', 'facilities', 'thermal'],
  },
  {
    id: 'ACME-9039',
    organizationId: 'org-acme-fin',
    title: 'Redis Cluster Memory Eviction Spike in OAuth Token Store',
    description: 'Memory usage reached 92% maxmemory capacity. Volatile-lru evicting active user refresh tokens causing re-authentication prompts for active web sessions.',
    severity: 'P2',
    status: 'identified',
    service: 'Security & Auth',
    createdAt: minutesAgo(35),
    acknowledgedAt: minutesAgo(28),
    assignedTo: MOCK_RESPONDERS[3], // Sarah Jenkins
    ttaDeadline: p2Sla.ttaDeadline,
    ttrDeadline: p2Sla.ttrDeadline,
    ttaBreached: false,
    ttrBreached: false,
    source: 'cloudwatch',
    warRoomUrl: 'https://warroom.company.internal/ACME-9039',
    videoBridgeUrl: 'https://meet.jit.si/Incident-Command-ACME-9039',
    tags: ['redis', 'auth', 'tokens', 'memory-eviction'],
    affectedMetrics: {
      latencyP99: '340 ms',
      errorRate: '2.1%',
    },
  },
  {
    id: 'NEX-9035',
    organizationId: 'org-nexus-cloud',
    title: 'Kafka Consumer Group Backlog (> 180k messages) in Audit Event Pipeline',
    description: 'Audit logger worker nodes crashing out-of-memory due to unhandled JSON schema payload modification in deployment v2.4.1.',
    severity: 'P3',
    status: 'monitoring',
    service: 'SRE Core',
    createdAt: minutesAgo(90),
    acknowledgedAt: minutesAgo(75),
    assignedTo: MOCK_RESPONDERS[0], // Alex Rivera
    ttaDeadline: p3Sla.ttaDeadline,
    ttrDeadline: p3Sla.ttrDeadline,
    ttaBreached: false,
    ttrBreached: false,
    source: 'prometheus',
    tags: ['kafka', 'audit-log', 'consumer-lag'],
  },
  {
    id: 'PRO-9028',
    organizationId: 'org-protiviti-in',
    title: 'Global CDN CSS Cache Misconfiguration & Asset 404s on Staging',
    description: 'Cloudflare edge node cache header override causing cache misses on static bundle assets.',
    severity: 'P4',
    status: 'resolved',
    service: 'Platform & DB',
    createdAt: minutesAgo(240),
    acknowledgedAt: minutesAgo(230),
    resolvedAt: minutesAgo(120),
    assignedTo: MOCK_RESPONDERS[4], // Marcus Vance
    ttaDeadline: p4Sla.ttaDeadline,
    ttrDeadline: p4Sla.ttrDeadline,
    ttaBreached: false,
    ttrBreached: false,
    source: 'user',
    rcaId: 'RCA-9028',
    tags: ['cdn', 'assets', 'frontend'],
  },
];

export const INITIAL_TIMELINE_EVENTS: Record<string, TimelineEvent[]> = {
  'INC-9042': [
    {
      id: 'te-1',
      incidentId: 'INC-9042',
      timestamp: minutesAgo(12),
      type: 'alert_ingested',
      author: 'Datadog Ingestor',
      content: 'Alert triggered: Payment Gateway HTTP 5xx error rate exceeded 18.5%',
    },
    {
      id: 'te-2',
      incidentId: 'INC-9042',
      timestamp: minutesAgo(11),
      type: 'escalation',
      author: 'Automated Routing Engine',
      content: 'Routed ticket to Tier 1 On-Call: David Chen (Payments Engine)',
    },
    {
      id: 'te-3',
      incidentId: 'INC-9042',
      timestamp: minutesAgo(10),
      type: 'responder_assigned',
      author: 'David Chen',
      content: 'Incident acknowledged by David Chen. SLA TTA satisfied in 2 minutes.',
    },
    {
      id: 'te-4',
      incidentId: 'INC-9042',
      timestamp: minutesAgo(7),
      type: 'status_change',
      author: 'David Chen',
      content: 'Changed status to Investigating. Auto-provisioned War Room & Video Bridge.',
    },
    {
      id: 'te-5',
      incidentId: 'INC-9042',
      timestamp: minutesAgo(3),
      type: 'note_added',
      author: 'Alex Rivera',
      content: 'Joined War Room. Inspected Stripe SDK logs; pool exhaustion confirmed. Increasing worker capacity pool by 2x.',
    },
  ],
  'INC-9041': [
    {
      id: 'te-10',
      incidentId: 'INC-9041',
      timestamp: minutesAgo(6),
      type: 'alert_ingested',
      author: 'Prometheus Ingestor',
      content: 'Alert triggered: postgres_pg_stat_database_numbackends > 980',
    },
    {
      id: 'te-11',
      incidentId: 'INC-9041',
      timestamp: minutesAgo(5),
      type: 'escalation',
      author: 'Automated Escalation',
      content: 'TTA Breach Warning! Ticket unacknowledged after 5 minutes. Paged Tier 2 Lead: Alex Rivera via SMS/Voice.',
    },
  ],
};

export const INITIAL_WAR_ROOM_MESSAGES: Record<string, WarRoomMessage[]> = {
  'INC-9042': [
    {
      id: 'wm-1',
      incidentId: 'INC-9042',
      sender: { name: 'System Sentinel', avatar: '/bot-avatar.png', role: 'Automation Bot' },
      message: '🚨 War Room established for INC-9042 [P1 - Critical]. Paging Payment Infrastructure responders.',
      timestamp: minutesAgo(12),
      isSystem: true,
    },
    {
      id: 'wm-2',
      incidentId: 'INC-9042',
      sender: { name: 'David Chen', avatar: MOCK_RESPONDERS[2].avatar, role: 'Senior Backend Lead' },
      message: 'I am taking point on this. Seeing 504 errors on Stripe payment intents. Connection pool maxed at 200 handles.',
      timestamp: minutesAgo(10),
    },
    {
      id: 'wm-3',
      incidentId: 'INC-9042',
      sender: { name: 'Elena Rostova', avatar: MOCK_RESPONDERS[1].avatar, role: 'Platform & DB' },
      message: 'Checked the database connections from the payment pods. DB load looks normal, issue is outbound network socket timeout to Stripe API.',
      timestamp: minutesAgo(6),
    },
    {
      id: 'wm-4',
      incidentId: 'INC-9042',
      sender: { name: 'Alex Rivera', avatar: MOCK_RESPONDERS[0].avatar, role: 'Staff SRE Lead' },
      message: 'Scaling payment service pods from 10 to 25 and enabling connection pooling keep-alive to flush stuck TCP sockets.',
      timestamp: minutesAgo(2),
    },
  ],
};

export const INITIAL_ON_CALL_SHIFTS: OnCallShift[] = [
  {
    id: 'shift-1',
    organizationId: 'org-protiviti-in',
    teamName: 'Payments & Checkout',
    service: 'Payments Engine',
    tier1: MOCK_RESPONDERS[2], // David Chen
    tier2: MOCK_RESPONDERS[0], // Alex Rivera
    executiveEscalation: MOCK_RESPONDERS[1], // Elena Rostova
    escalationTimeoutMins: 5,
    shiftStart: '08:00 AM UTC',
    shiftEnd: '08:00 PM UTC',
  },
  {
    id: 'shift-2',
    organizationId: 'org-protiviti-in',
    teamName: 'Database & Infrastructure',
    service: 'Platform & DB',
    tier1: MOCK_RESPONDERS[1], // Elena Rostova
    tier2: MOCK_RESPONDERS[4], // Marcus Vance
    executiveEscalation: MOCK_RESPONDERS[0],
    escalationTimeoutMins: 5,
    shiftStart: '08:00 AM UTC',
    shiftEnd: '08:00 PM UTC',
  },
  {
    id: 'shift-3',
    organizationId: 'org-acme-fin',
    teamName: 'Identity & Access',
    service: 'Security & Auth',
    tier1: MOCK_RESPONDERS[3], // Sarah Jenkins
    tier2: MOCK_RESPONDERS[2],
    executiveEscalation: MOCK_RESPONDERS[0],
    escalationTimeoutMins: 15,
    shiftStart: '12:00 AM UTC',
    shiftEnd: '12:00 PM UTC',
  },
];

export const INITIAL_RCA_REPORTS: RcaReport[] = [
  {
    id: 'RCA-9043',
    incidentId: 'PRO-9043',
    organizationId: 'org-protiviti-in',
    title: 'Incident Occurrence Report: Kolkata 10th Floor Server Room AC Failure',
    severity: 'P2',
    author: 'Arijit Naskar',
    createdAt: minutesAgo(290),
    updatedAt: minutesAgo(60),
    summary: 'The AC unit in the 10th Floor Kolkata Server Room tripped, leading to a sudden temperature surge. HVAC Technician was dispatched on 30th Dec 2025, resolved compressor relay issue, and unit is under continuous thermal observation.',
    impact: {
      durationMinutes: 90,
      usersAffected: 0,
      affectedServices: ['Kolkata On-Premises Server Room 10F'],
      revenueImpact: '$0 (No hardware damage or data loss)',
    },
    fiveWhys: [
      'Why did server room temperature increase? AC unit on 10th Floor stopped cooling.',
      'Why did AC unit stop cooling? High-pressure trip relay engaged due to condenser fan motor thermal overload.',
      'Why did motor experience thermal overload? Intake dust filter accumulation restricted airflow during weekend shift.',
      'Why was filter restricted? Bi-weekly preventive maintenance checklist was delayed by 3 days.',
      'Why was maintenance delayed? Facilities technician shift handover schedule lacked automated reminder trigger.',
    ],
    rootCause: 'Airflow restriction due to dust filter build-up caused compressor high-pressure thermal trip during off-peak weekend hours.',
    detectionDetails: 'Detected via Facilities IoT temperature sensor threshold alert exceeding 26.5°C.',
    mitigationSteps: 'Dispatched HVAC technician on 30 Dec 2025; cleaned intake filters, reset thermal relay breaker, and restored cooling to 18°C.',
    actionItems: [
      {
        id: 'ai-101',
        title: 'Install secondary redundant backup AC unit in 10th Floor Server Room',
        assignee: 'Arijit Naskar',
        status: 'in_progress',
        priority: 'high',
      },
      {
        id: 'ai-102',
        title: 'Automate weekly Facilities HVAC preventive maintenance checklist in Sentinel',
        assignee: 'Rahul Lal',
        status: 'todo',
        priority: 'medium',
      },
    ],
    status: 'reviewed',
  },
  {
    id: 'RCA-9028',
    incidentId: 'PRO-9028',
    organizationId: 'org-protiviti-in',
    title: 'Post-Mortem: CDN Asset 404 Cache Misconfiguration',
    severity: 'P4',
    author: 'Marcus Vance',
    createdAt: minutesAgo(110),
    updatedAt: minutesAgo(90),
    summary: 'A deployment script override caused Cloudflare edge cache rules to bypass origin static assets for staging domains.',
    impact: {
      durationMinutes: 120,
      usersAffected: 450,
      affectedServices: ['Frontend CDN', 'Staging Gateway'],
      revenueImpact: '$0 (Staging Environment)',
    },
    fiveWhys: [
      'Why did staging assets fail to load? CDN returned 404 on CSS/JS bundles.',
      'Why did CDN return 404? Edge cache purge header invalidation rule was pointed to wrong path.',
      'Why was path invalid? CI/CD deployment variable override was modified in PR #482.',
      'Why was PR #482 merged without validation? CI integration test suite lacked CDN integration check.',
      'Why was test missing? CDN test suite was deferred in Q2 roadmap.',
    ],
    rootCause: 'CI/CD pipeline lacked automated validation step for CDN edge rule header overrides during deployment execution.',
    detectionDetails: 'Detected via internal frontend synthetic monitoring check alerting on asset HTTP 404 status.',
    mitigationSteps: 'Reverted PR #482 configuration and refreshed edge cache rules across Cloudflare zones.',
    actionItems: [
      {
        id: 'ai-1',
        title: 'Add automated CDN edge configuration validator to Terraform pipeline',
        assignee: 'Marcus Vance',
        status: 'in_progress',
        priority: 'high',
      },
      {
        id: 'ai-2',
        title: 'Update staging deployment checklist to require smoke tests on static asset URLs',
        assignee: 'Elena Rostova',
        status: 'completed',
        priority: 'medium',
      },
    ],
    status: 'reviewed',
  },
];
