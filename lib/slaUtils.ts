import { Severity, SLAConfig } from './types';

export const DEFAULT_SLA_CONFIG: SLAConfig = {
  P1: { ttaMins: 5, ttrMins: 30 },
  P2: { ttaMins: 15, ttrMins: 120 },
  P3: { ttaMins: 60, ttrMins: 480 },
  P4: { ttaMins: 240, ttrMins: 1440 },
};

export function calculateSLADeadlines(createdAtISO: string, severity: Severity) {
  const createdAt = new Date(createdAtISO).getTime();
  const config = DEFAULT_SLA_CONFIG[severity];

  const ttaDeadline = new Date(createdAt + config.ttaMins * 60 * 1000).toISOString();
  const ttrDeadline = new Date(createdAt + config.ttrMins * 60 * 1000).toISOString();

  return { ttaDeadline, ttrDeadline };
}

export function getTimeRemaining(deadlineISO: string) {
  const now = Date.now();
  const deadline = new Date(deadlineISO).getTime();
  const diffMs = deadline - now;

  const isBreached = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

  const formatted = `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;

  return {
    isBreached,
    diffMs,
    formatted: isBreached ? `Breached by ${formatted}` : formatted,
  };
}

export function formatDuration(startISO: string, endISO?: string) {
  const start = new Date(startISO).getTime();
  const end = endISO ? new Date(endISO).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);

  const mins = Math.floor(diffMs / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }
  return `${mins}m ${secs}s`;
}
