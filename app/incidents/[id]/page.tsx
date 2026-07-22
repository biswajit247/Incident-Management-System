import React from 'react';
import IncidentDetailClient from '@/components/IncidentDetailClient';
import { INITIAL_INCIDENTS } from '@/lib/mockData';

// This is required for Next.js static export (output: 'export') to pre-render dynamic routes
export function generateStaticParams() {
  const params = INITIAL_INCIDENTS.flatMap(incident => [
    { id: incident.id },
    // Also generate aliases to support direct ID lookup and PRO prefix matching
    { id: incident.id.replace('INC-', 'PRO-') },
    { id: incident.id.replace('PRO-', 'INC-') },
    { id: incident.id.replace('INC-', '').replace('PRO-', '') }
  ]);
  
  // Return unique params list
  const uniqueParams = Array.from(new Set(params.map(p => p.id))).map(id => ({ id }));
  return uniqueParams;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function IncidentDetailPage({ params }: PageProps) {
  return <IncidentDetailClient id={params.id} />;
}
