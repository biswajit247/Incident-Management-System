import { NextRequest, NextResponse } from 'next/server';
import { MOCK_ORGANIZATIONS } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'success',
    count: MOCK_ORGANIZATIONS.length,
    organizations: MOCK_ORGANIZATIONS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = body.name || 'New Enterprise Tenant';
    const subdomain = body.subdomain || 'tenant.sentinel.io';
    const prefix = body.prefix || 'TENANT';

    const newOrg = {
      id: `org-${Date.now()}`,
      name,
      subdomain,
      prefix,
      badgeColor: '#3b82f6',
      slaSettings: {
        P1: { ttaMins: 5, ttrMins: 30 },
        P2: { ttaMins: 15, ttrMins: 120 },
        P3: { ttaMins: 60, ttrMins: 480 },
        P4: { ttaMins: 240, ttrMins: 1440 },
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      status: 'success',
      message: `Organization ${name} registered successfully with subdomain ${subdomain}.`,
      organization: newOrg,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Failed to process organization registration payload.',
    }, { status: 400 });
  }
}
