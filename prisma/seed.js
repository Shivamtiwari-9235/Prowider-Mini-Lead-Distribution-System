import 'dotenv/config';
import prisma from '../lib/prisma.js';

async function main() {
  const servicesData = [
    { name: 'Service 1' },
    { name: 'Service 2' },
    { name: 'Service 3' },
  ];
  for (const serviceData of servicesData) {
    await prisma.service.upsert({
      where: { name: serviceData.name },
      update: {},
      create: serviceData,
    });
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
    await prisma.provider.upsert({
      where: { name: providerItem.name },
      update: {},
      create: providerItem,
    });
  }

  const services = await prisma.service.findMany();
  for (const service of services) {
    await prisma.allocationState.upsert({
      where: { serviceId: service.id },
      update: {},
      create: { serviceId: service.id, nextIndex: 0 },
    });
  }

  console.log('Seed data loaded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
