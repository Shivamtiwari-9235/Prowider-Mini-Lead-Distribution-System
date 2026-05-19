import { NextResponse } from 'next/server';
import { getPrisma } from '../../../lib/prisma.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prisma = getPrisma();
  const providers = await prisma.provider.findMany({
    orderBy: { name: 'asc' },
    include: {
      assignments: {
        orderBy: { assignedAt: 'desc' },
        include: {
          lead: {
            include: { service: true },
          },
        },
      },
    },
  });

  const mapped = providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    monthlyQuota: provider.monthlyQuota,
    remainingQuota: provider.remainingQuota,
    leadCount: provider.assignments.length,
    leads: provider.assignments.map((assignment) => ({
      id: assignment.lead.id,
      name: assignment.lead.name,
      phone: assignment.lead.phone,
      city: assignment.lead.city,
      description: assignment.lead.description,
      serviceName: assignment.lead.service.name,
      assignedAt: assignment.assignedAt.toISOString(),
    })),
  }));

  return NextResponse.json({ providers: mapped });
}
