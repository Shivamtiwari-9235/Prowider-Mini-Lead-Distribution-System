import { NextResponse } from 'next/server';
import { getPrisma } from '../../../lib/prisma.js';
import { ensureSeeded } from '../../../lib/initDb.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSeeded();
    const prisma = getPrisma();
    const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Services API error:', error?.message || String(error));
    
    // Fallback response with hardcoded services if database is unavailable
    const fallbackServices = [
      { id: 'temp-1', name: 'Service 1' },
      { id: 'temp-2', name: 'Service 2' },
      { id: 'temp-3', name: 'Service 3' },
    ];
    
    return NextResponse.json(
      { 
        services: fallbackServices,
        warning: 'Database temporarily unavailable. Using default services.'
      },
      { status: 200 }
    );
  }
}
