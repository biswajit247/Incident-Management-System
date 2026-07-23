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
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-101',
    name: 'Biswajit Naskar',
    email: 'biswajit@protiviti.com',
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
    name: 'Aniruddha Kar',
    email: 'aniruddha@protiviti.com',
    organizationId: 'org-protiviti-in',
    role: 'Reporter',
    title: 'Facilities Operations Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
];

export const MOCK_RESPONDERS: Responder[] = [
  {
    id: 'resp-1',
    name: 'Aniruddha Kar',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    role: 'Staff SRE Lead',
    email: 'alex.rivera@company.internal',
    phone: '+1 (555) 234-8901',
    team: 'SRE Core',
  },
  {
    id: 'resp-2',
    name: 'Biswajit Naskar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    role: 'Principal Infrastructure Eng',
    email: 'elena.r@company.internal',
    phone: '+1 (555) 892-1144',
    team: 'Platform & DB',
  },
  {
    id: 'resp-3',
    name: 'Aniruddha Kar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    role: 'Senior Backend Lead',
    email: 'david.chen@company.internal',
    phone: '+1 (555) 431-9022',
    team: 'Core Platform',
  },
  {
    id: 'resp-4',
    name: 'Biswajit Naskar',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'SecOps Architect',
    email: 'sarah.j@company.internal',
    phone: '+1 (555) 762-3390',
    team: 'Security & Auth',
  },
  {
    id: 'resp-5',
    name: 'Aniruddha Kar',
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
    id: 'PRO-9041',
    organizationId: 'org-protiviti-in',
    title: 'Production Database Primary Node High Disk I/O & Connection Saturation',
    description: 'Prometheus Alert: postgres_pg_stat_database_numbackends > 980 (Limit: 1000). Unindexed query from analytics pipeline blocking write locks on customer_sessions table.',
    severity: 'P1',
    status: 'resolved',
    service: 'Platform & DB',
    createdAt: minutesAgo(60),
    acknowledgedAt: minutesAgo(55),
    resolvedAt: minutesAgo(1),
    assignedTo: MOCK_RESPONDERS[1], // Biswajit Naskar
    ttaDeadline: p1_2Sla.ttaDeadline,
    ttrDeadline: p1_2Sla.ttrDeadline,
    ttaBreached: false,
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
    assignedTo: MOCK_RESPONDERS[1], // Biswajit Naskar
    ttaDeadline: p2Sla.ttaDeadline,
    ttrDeadline: p2Sla.ttrDeadline,
    ttaBreached: false,
    ttrBreached: false,
    source: 'user',
    rcaId: 'RCA-9043',
    tags: ['kolkata', 'server-room', 'ac-failure', 'facilities', 'thermal'],
  },
  {
    id: 'PRO-9045',
    organizationId: 'org-protiviti-in',
    title: 'BENGALURU IOF: 4th Floor UPS System Beeping & Battery Fault',
    description: 'BENGALURU IOF: 4th Floor Server Room UPS-02 beeping with battery replacement alarm. [Reported by Rahul Lal]',
    severity: 'P2',
    status: 'triggered',
    service: 'Platform & DB',
    createdAt: minutesAgo(2),
    assignedTo: MOCK_RESPONDERS[1], // Biswajit Naskar
    ttaDeadline: p2Sla.ttaDeadline,
    ttrDeadline: p2Sla.ttrDeadline,
    ttaBreached: false,
    ttrBreached: false,
    source: 'user',
    tags: ['iof-compliance', 'bengaluru', 'facilities'],
  },
  {
    id: 'ACME-9039',
    organizationId: 'org-acme-fin',
    title: 'Redis Cluster Memory Eviction Spike in OAuth Token Store',
    description: 'Memory usage reached 92% maxmemory capacity. Volatile-lru evicting active user refresh tokens causing re-authentication prompts for active web sessions.',
    severity: 'P2',
    status: 'resolved',
    service: 'Security & Auth',
    createdAt: minutesAgo(35),
    acknowledgedAt: minutesAgo(28),
    resolvedAt: minutesAgo(5),
    assignedTo: MOCK_RESPONDERS[3], // Biswajit Naskar
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
    status: 'resolved',
    service: 'SRE Core',
    createdAt: minutesAgo(90),
    acknowledgedAt: minutesAgo(75),
    resolvedAt: minutesAgo(10),
    assignedTo: MOCK_RESPONDERS[0], // Aniruddha Kar
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
    assignedTo: MOCK_RESPONDERS[4], // Aniruddha Kar
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
      content: 'TTA Breach Warning! Ticket unacknowledged after 5 minutes. Paged Tier 2 Lead: Aniruddha Kar via SMS/Voice.',
    },
  ],
};

export const INITIAL_WAR_ROOM_MESSAGES: Record<string, WarRoomMessage[]> = {};

export const INITIAL_ON_CALL_SHIFTS: OnCallShift[] = [
  {
    id: 'shift-2',
    organizationId: 'org-protiviti-in',
    teamName: 'Database & Infrastructure',
    service: 'Platform & DB',
    tier1: MOCK_RESPONDERS[1], // Biswajit Naskar
    tier2: MOCK_RESPONDERS[4], // Aniruddha Kar
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
    tier1: MOCK_RESPONDERS[3], // Biswajit Naskar
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
    author: 'Biswajit Naskar',
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
        assignee: 'Biswajit Naskar',
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
    author: 'Aniruddha Kar',
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
        assignee: 'Aniruddha Kar',
        status: 'in_progress',
        priority: 'high',
      },
      {
        id: 'ai-2',
        title: 'Update staging deployment checklist to require smoke tests on static asset URLs',
        assignee: 'Biswajit Naskar',
        status: 'completed',
        priority: 'medium',
      },
    ],
    status: 'completed',
  },
];
