'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = async () => {
    try {
      const response = await fetch('/api/providers');
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || 'Unable to load provider dashboard.');
        return;
      }
      setProviders(body.providers);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Unable to load provider dashboard.');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="main">
      <div className="card">
        <h1>Provider Dashboard</h1>
        <p>Live provider quotas and assigned leads. This page refreshes automatically every few seconds.</p>
        <div style={{ marginTop: '16px' }}>
          <strong>Last refresh:</strong> {lastUpdated || 'Loading...'}
        </div>
        {error ? <div className="status error" style={{ marginTop: '16px' }}>{error}</div> : null}
      </div>

      <div className="grid" style={{ marginTop: '24px' }}>
        {providers.map((provider) => (
          <div key={provider.id} className="card">
            <h2>{provider.name}</h2>
            <p><strong>Remaining quota:</strong> {provider.remainingQuota} / {provider.monthlyQuota}</p>
            <p><strong>Leads assigned:</strong> {provider.leadCount}</p>
            <div style={{ marginTop: '16px' }}>
              <strong>Assigned leads</strong>
              {provider.leads.length === 0 ? (
                <p style={{ marginTop: '8px' }}>No leads yet.</p>
              ) : (
                <ul style={{ marginTop: '12px', paddingLeft: '18px' }}>
                  {provider.leads.map((lead) => (
                    <li key={lead.id} style={{ marginBottom: '10px' }}>
                      <div><strong>{lead.name}</strong> ({lead.phone})</div>
                      <div>{lead.serviceName} · {lead.city}</div>
                      <div style={{ color: '#4b5563', fontSize: '0.95rem' }}>Assigned: {new Date(lead.assignedAt).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
