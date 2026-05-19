import { getPrisma } from './prisma.js';

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  
  const prisma = getPrisma();
  const serviceCount = await prisma.service.count();
  
  if (serviceCount === 0) {
    try {
      const servicesData = [
        { name: 'Service 1' },
        { name: 'Service 2' },
        { name: 'Service 3' },
      ];
      for (const serviceData of servicesData) {
        await prisma.service.create({ data: serviceData });
      }

      const providerData = [
        { name: 'Provider 1', monthlyQuota: 10, remainingQuota: 10 },
        { name: 'Provider 2', monthlyQuota: 10, remainingQuota: 10 },
        { name: 'Provider 3', monthlyQuota: 10, remainingQuota: 10 },
        { name: 'Provider 4', monthlyQuota: 10, remainingQuota: 10 },
        { name: 'Provider 5', monthlyQuota: 10, remainingQuota: 10 },
        { name: 'Provider 6', monthlyQuota: 10, remainingQuota: 10 },
        { name: 'Provider 7', monthlyQuota: 10, remainingQuota: 10 },
        { name: 'Provider 8', monthlyQuota: 10, remainingQuota: 10 },
      ];
      for (const providerItem of providerData) {
        await prisma.provider.create({ data: providerItem });
      }

      const services = await prisma.service.findMany();
      for (const service of services) {
        await prisma.allocationState.upsert({
          where: { serviceId: service.id },
          update: {},
          create: { serviceId: service.id, nextIndex: 0 },
        });
      }

      seeded = true;
    } catch (err) {
      console.error('Seed error:', err);
    }
  } else {
    seeded = true;
  }
}

export { ensureSeeded };
