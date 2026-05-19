'use client';

import { useEffect, useState } from 'react';

export default function RequestServicePage() {
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    serviceId: '',
    description: '',
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(null);
    setServicesLoading(true);
    fetch('/api/services')
      .then((res) => {
        if (!res.ok) throw new Error('Services API failed');
        return res.json();
      })
      .then((data) => {
        if (!data.services || data.services.length === 0) {
          setStatus({ type: 'error', message: 'No services available at the moment.' });
          setServices([]);
        } else {
          setServices(data.services);
          setForm((current) => ({ ...current, serviceId: data.services[0].id }));
        }
      })
      .catch((err) => {
        console.error('Services load error:', err);
        setStatus({ type: 'error', message: 'Failed to load services. Please refresh the page.' });
        setServices([]);
      })
      .finally(() => {
        setServicesLoading(false);
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) {
        setStatus({ type: 'error', message: body.error || 'Failed to submit lead.' });
      } else {
        setStatus({ type: 'success', message: 'Lead submitted and assigned successfully.' });
        setForm({ name: '', phone: '', city: '', serviceId: services[0]?.id ?? '', description: '' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Unexpected error submitting lead.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="card">
        <h1>Request Service</h1>
        <p>Submit a customer enquiry to create a lead and assign providers automatically.</p>
        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <div className="grid grid-2">
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-2" style={{ marginTop: '16px' }}>
            <div>
              <label htmlFor="city">City</label>
              <input
                id="city"
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="service">Service Type</label>
              <select
                id="service"
                value={form.serviceId}
                onChange={(event) => setForm({ ...form, serviceId: event.target.value })}
                required
                disabled={servicesLoading || services.length === 0}
              >
                <option value="">{servicesLoading ? 'Loading services...' : services.length === 0 ? 'No services available' : 'Select a service'}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <button type="submit" disabled={loading || servicesLoading || services.length === 0}>{loading ? 'Submitting...' : 'Submit Lead'}</button>
          </div>
        </form>
        {status ? (
          <div className={`status ${status.type}`}>
            {status.message}
          </div>
        ) : null}
      </div>
    </main>
  );
}
