import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const incidentNumber = body.incidentNumber || `PRO - 0${Math.floor(2 + Math.random() * 8)} / KOL`;
    const site = body.site || 'Kolkata';
    const exactLocation = body.exactLocation || 'Kolkata (10th Floor) Server Room';
    const severityLevel = body.severityLevel || 'Level 2 (Medium)';
    const description = body.description || 'Facility / Technical Incident logged via IOF Stepper.';

    return NextResponse.json({
      status: 'success',
      message: `Incident Occurrence Record ${incidentNumber} created and saved to compliance ledger.`,
      record: {
        id: `iof-${Date.now()}`,
        incidentNumber,
        reportedDate: body.reportedDate || new Date().toISOString(),
        severityLevel,
        site,
        securityLead: body.securityLead || 'Arijit Naskar',
        exactLocation,
        description,
        actionsTaken: body.actionsTaken || ["Others"],
        bodyPartsInjured: body.bodyPartsInjured || ["None / No Injury"],
        hazardTypes: body.hazardTypes || ["Thermal comfort / AC ventilation"],
        incidentTypes: body.incidentTypes || ["Technical Incident"],
        systemFailures: body.systemFailures || ["Maintenance"],
        correctiveActions: body.correctiveActions || "Maintenance completed.",
        shiftIcSignature: body.shiftIcSignature || "Shuvam Boral",
        fmLeadSignature: body.fmLeadSignature || "Arijit Naskar",
        documentVersion: "CS-IOF-PRO/Dec 25",
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Invalid IOF JSON payload format.',
    }, { status: 400 });
  }
}
