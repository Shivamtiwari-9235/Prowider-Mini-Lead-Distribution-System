import { NextResponse } from 'next/server';
import { resetQuotas } from '../../../../lib/leadAllocation.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json();
  const eventId = body?.eventId;
  if (!eventId) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
  }

  const result = await resetQuotas(eventId);
  return NextResponse.json({ success: true, reused: result.reused });
}
