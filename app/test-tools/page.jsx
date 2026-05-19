'use client';

import { useState } from 'react';

export default function TestToolsPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendRequest = async (path, body) => {
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();
      setStatus(JSON.stringify(result, null, 2));
    } catch (error) {
      setStatus('Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuota = async () => {
    await sendRequest('/api/test/webhook', { eventId: 'reset-quotas-demo' });
  };

  const handleCallWebhookMultiple = async () => {
    setLoading(true);
    setStatus('Calling webhook 3 times...');
    try {
      const eventId = 'reset-quotas-demo';
      const results = [];
      for (let i = 0; i < 3; i += 1) {
        const response = await fetch('/api/test/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId }),
        });
        results.push(await response.json());
      }
      setStatus(`Webhook responses:\n${results.map((result) => JSON.stringify(result)).join('\n')}`);
    } catch (error) {
      setStatus('Webhook test failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLeads = async () => {
    await sendRequest('/api/test/generate', { count: 10 });
  };

  return (
    <main className="main">
      <div className="card">
        <h1>Test Tools</h1>
        <p>Use these helpers to reset quotas, verify webhook idempotency, and generate concurrent leads.</p>
        <div className="grid" style={{ marginTop: '24px' }}>
          <button disabled={loading} onClick={handleResetQuota}>Reset provider quotas</button>
          <button disabled={loading} onClick={handleCallWebhookMultiple}>Call webhook 3x</button>
          <button disabled={loading} onClick={handleGenerateLeads}>Generate 10 leads concurrently</button>
        </div>
        {status ? (
          <pre className="status" style={{ marginTop: '24px', whiteSpace: 'pre-wrap' }}>{status}</pre>
        ) : null}
      </div>
    </main>
  );
}
