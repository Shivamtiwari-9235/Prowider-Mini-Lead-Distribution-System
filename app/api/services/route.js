import { NextResponse } from 'next/server';
import { getPrisma } from '../../../lib/prisma.js';
import { ensureSeeded } from '../../../lib/initDb.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSeeded();
  const prisma = getPrisma();
  const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ services });
}
