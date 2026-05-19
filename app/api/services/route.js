import { NextResponse } from 'next/server';
import { getPrisma } from '../../../lib/prisma.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prisma = getPrisma();
  const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ services });
}
