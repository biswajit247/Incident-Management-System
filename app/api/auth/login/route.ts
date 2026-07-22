import { NextRequest, NextResponse } from 'next/server';
import { MOCK_USERS, MOCK_ORGANIZATIONS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ status: 'error', message: 'Email address is required.' }, { status: 400 });
    }

    // Lookup user in mock database
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'User not registered in any enterprise tenant.' }, { status: 401 });
    }

    const org = MOCK_ORGANIZATIONS.find(o => o.id === user.organizationId);

    // Construct JWT Payload
    const jwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      orgId: user.organizationId,
      orgName: org?.name || 'Enterprise Tenant',
      subdomain: org?.subdomain,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 Hours
    };

    // JWT token encoding
    const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.sentinel_sec_sig`;

    return NextResponse.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        avatar: user.avatar,
        organization: org,
      },
      jwtPayload,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Authentication failed.' }, { status: 500 });
  }
}
