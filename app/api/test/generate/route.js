import { NextResponse } from 'next/server';
import { createManyRandomLeads } from '../../../../lib/leadAllocation.js';

export async function POST(request) {
  const body = await request.json();
  const count = typeof body?.count === 'number' && body.count > 0 ? body.count : 10;

  const results = await createManyRandomLeads(count);
  const successes = results.filter((item) => item.status === 'fulfilled').length;
  const failures = results.filter((item) => item.status === 'rejected').length;

  return NextResponse.json({ success: true, requested: count, successes, failures });
}
