import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { createLead } from '../../../lib/leadAllocation.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, city, description, serviceId } = body;
    if (!name || !phone || !city || !description || !serviceId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    await createLead({ name, phone, city, description, serviceId });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate lead found for this phone and service.' }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : 'Unable to create lead.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
