import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = body.title || body.alert_name || body.event_title || 'Monitoring System Alert';
    const severity = body.severity || 'P1';
    const service = body.service || 'Platform & DB';
    const description = body.description || body.summary || 'Auto-ingested alert telemetry payload.';

    const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      status: 'success',
      message: 'Alert webhook ingested and auto-routed to On-Call responder.',
      incident: {
        id: incidentId,
        title,
        severity,
        service,
        description,
        status: 'triggered',
        pagedChannel: 'SMS & VOICE_CALL',
        timestamp: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Failed to parse incoming webhook JSON payload',
    }, { status: 400 });
  }
}
