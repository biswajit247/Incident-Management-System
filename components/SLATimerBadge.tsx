'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { getTimeRemaining, formatDuration } from '@/lib/slaUtils';
import { Incident } from '@/lib/types';

interface SLATimerBadgeProps {
  incident: Incident;
  type: 'TTA' | 'TTR';
  compact?: boolean;
}

export default function SLATimerBadge({ incident, type, compact = false }: SLATimerBadgeProps) {
  const [timerText, setTimerText] = useState('');
  const [isBreached, setIsBreached] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const deadlineISO = type === 'TTA' ? incident.ttaDeadline : incident.ttrDeadline;
  const isAcknowledged = !!incident.acknowledgedAt;
  const isResolved = incident.status === 'resolved';

  useEffect(() => {
    const updateTimer = () => {
      // Check if already completed
      if (type === 'TTA' && isAcknowledged) {
        setIsDone(true);
        setIsBreached(incident.ttaBreached);
        setTimerText(formatDuration(incident.createdAt, incident.acknowledgedAt));
        return;
      }

      if (type === 'TTR' && isResolved) {
        setIsDone(true);
        setIsBreached(incident.ttrBreached);
        setTimerText(formatDuration(incident.createdAt, incident.resolvedAt));
        return;
      }

      const res = getTimeRemaining(deadlineISO);
      setIsBreached(res.isBreached);
      setTimerText(res.formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [incident, type, deadlineISO, isAcknowledged, isResolved]);

  if (isDone) {
    return (
      <div className={`inline-flex items-center space-x-1.5 rounded-md px-2 py-0.5 font-mono font-medium ${
        compact ? 'text-[10px]' : 'text-xs'
      } ${
        isBreached 
          ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
          : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
      }`}>
        <CheckCircle2 className="h-3 w-3" />
        <span>{type}: {timerText}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 rounded-md px-2 py-0.5 font-mono font-medium transition-colors ${
      compact ? 'text-[10px]' : 'text-xs'
    } ${
      isBreached 
        ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse shadow-sm shadow-red-500/30' 
        : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
    }`}>
      {isBreached ? (
        <AlertOctagon className="h-3 w-3 text-red-400" />
      ) : (
        <Clock className="h-3 w-3 text-amber-400" />
      )}
      <span>{type}: {timerText}</span>
    </div>
  );
}
