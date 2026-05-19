(async () => {
  try {
    const base = 'http://localhost:3000';
    const out = (label, data) => console.log('==== ' + label + ' ====', typeof data === 'string' ? data : JSON.stringify(data, null, 2));

    // Fetch services
    const servicesRes = await fetch(base + '/api/services');
    const services = await servicesRes.json();
    out('services', services);

    const service1 = services.services.find(s => s.name === 'Service 1') || services.services[0];
    if (!service1) throw new Error('No service found');

    // Create a lead (Service 1)
    const leadPayload = {
      name: 'Smoke Test User',
      phone: '9999999999',
      city: 'SmokeCity',
      description: 'Smoke test lead',
      serviceId: service1.id,
    };
    const createRes = await fetch(base + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload),
    });
    out('createLead status', { status: createRes.status });
    out('createLead body', await createRes.text());

    // Try duplicate
    const dupRes = await fetch(base + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload),
    });
    out('duplicate status', { status: dupRes.status });
    out('duplicate body', await dupRes.text());

    // Call webhook twice
    const eventId = 'smoke-reset-1';
    const hook1 = await fetch(base + '/api/test/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId }) });
    out('webhook1', { status: hook1.status, body: await hook1.text() });
    const hook2 = await fetch(base + '/api/test/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId }) });
    out('webhook2', { status: hook2.status, body: await hook2.text() });

    // Generate 10 leads
    const gen = await fetch(base + '/api/test/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 10 }) });
    out('generate', { status: gen.status, body: await gen.text() });

    // Fetch providers
    const provRes = await fetch(base + '/api/providers');
    const provs = await provRes.json();
    out('providers summary', provs.providers.map(p => ({ name: p.name, remainingQuota: p.remainingQuota, leadCount: p.leadCount } )));

    console.log('SMOKE TESTS COMPLETED');
  } catch (err) {
    console.error('SMOKE TEST ERROR', err);
    process.exitCode = 2;
  }
})();
