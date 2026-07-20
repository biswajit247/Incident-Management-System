'use client';

import React from 'react';
import OnCallScheduleView from '@/components/OnCallScheduleView';
import { useIncidentStore } from '@/lib/store';

export default function SchedulesPage() {
  const { isLoaded } = useIncidentStore();

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      <OnCallScheduleView />
    </div>
  );
}
