import prisma from './prisma';

const mandatoryMap = {
  'Service 1': ['Provider 1'],
  'Service 2': ['Provider 5'],
  'Service 3': ['Provider 1', 'Provider 4'],
};

const poolMap = {
  'Service 1': ['Provider 2', 'Provider 3', 'Provider 4'],
  'Service 2': ['Provider 6', 'Provider 7', 'Provider 8'],
  'Service 3': ['Provider 2', 'Provider 3', 'Provider 5', 'Provider 6', 'Provider 7', 'Provider 8'],
};

export async function createLead(input) {
  return prisma.$transaction(async (tx) => {
    const service = await tx.service.findUnique({
      where: { id: input.serviceId },
    });
    if (!service) {
      throw new Error('Service not found');
    }

    const mandatoryProviderNames = mandatoryMap[service.name] || [];
    const poolProviderNames = poolMap[service.name] || [];
    if (mandatoryProviderNames.length >= 3) {
      throw new Error('Service configuration invalid: too many mandatory providers');
    }

    const providers = await tx.provider.findMany({
      where: {
        name: {
          in: [...mandatoryProviderNames, ...poolProviderNames],
        },
      },
      orderBy: { name: 'asc' },
    });

    const providerByName = Object.fromEntries(providers.map((provider) => [provider.name, provider]));
    const mandatoryProviders = mandatoryProviderNames.map((name) => {
      const provider = providerByName[name];
      if (!provider) {
        throw new Error(`Mandatory provider ${name} not found`);
      }
      return provider;
    });

    for (const provider of mandatoryProviders) {
      if (provider.remainingQuota <= 0) {
        throw new Error(`Mandatory provider ${provider.name} does not have quota`);
      }
    }

    await tx.allocationState.upsert({
      where: { serviceId: service.id },
      update: {},
      create: { serviceId: service.id, nextIndex: 0 },
    });

    const allocationState = await tx.allocationState.findUnique({
      where: { serviceId: service.id },
    });
    if (!allocationState) {
      throw new Error('Allocation state missing after creation');
    }

    const requiredCount = 3;
    const assignedProviders = new Map();
    for (const provider of mandatoryProviders) {
      assignedProviders.set(provider.id, provider);
    }

    const poolNames = poolProviderNames;
    const poolLength = poolNames.length;
    if (poolLength === 0) {
      throw new Error('Provider pool configuration invalid');
    }

    let currentIndex = allocationState.nextIndex % poolLength;
    const selectedPoolProviders = [];
    const poolScanLimit = poolLength * 2;
    let scanned = 0;

    while (selectedPoolProviders.length < requiredCount - mandatoryProviders.length && scanned < poolScanLimit) {
      const nextName = poolNames[currentIndex];
      const provider = providerByName[nextName];
      if (provider && provider.remainingQuota > 0 && !assignedProviders.has(provider.id)) {
        selectedPoolProviders.push(provider);
        assignedProviders.set(provider.id, provider);
      }
      currentIndex = (currentIndex + 1) % poolLength;
      scanned += 1;
    }

    if (selectedPoolProviders.length < requiredCount - mandatoryProviders.length) {
      throw new Error('Unable to fill provider slots with available quota');
    }

    const nextIndex = currentIndex;

    const lead = await tx.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        city: input.city,
        description: input.description,
        serviceId: input.serviceId,
        assignments: {
          create: Array.from(assignedProviders.values()).map((provider) => ({
            provider: {
              connect: { id: provider.id },
            },
          })),
        },
      },
      include: {
        assignments: true,
      },
    });

    for (const provider of assignedProviders.values()) {
      const result = await tx.provider.updateMany({
        where: {
          id: provider.id,
          remainingQuota: { gt: 0 },
        },
        data: {
          remainingQuota: { decrement: 1 },
        },
      });
      if (result.count === 0) {
        throw new Error(`Provider quota changed before assignment: ${provider.name}`);
      }
    }

    await tx.allocationState.update({
      where: { serviceId: service.id },
      data: { nextIndex },
    });

    return lead;
  });
}

export async function resetQuotas(eventId) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existing) {
      return { reused: true };
    }

    await tx.webhookEvent.create({
      data: {
        eventId,
        eventType: 'reset-quotas',
      },
    });

    const providers = await tx.provider.findMany();
    for (const provider of providers) {
      await tx.provider.update({
        where: { id: provider.id },
        data: { remainingQuota: provider.monthlyQuota },
      });
    }

    return { reused: false };
  });
}

export async function createManyRandomLeads(count) {
  const services = await prisma.service.findMany();
  const phoneBase = 9000000000;
  const results = [];
  for (let index = 0; index < count; index += 1) {
    const service = services[index % services.length];
    try {
      const lead = await createLead({
        name: `Test Lead ${Date.now()}-${index}`,
        phone: `${phoneBase + index}`,
        city: 'Test City',
        description: `Generated lead ${index}`,
        serviceId: service.id,
      });
      results.push({ status: 'fulfilled', value: lead });
    } catch (err) {
      results.push({ status: 'rejected', reason: String(err) });
    }
  }
  return results;
}
