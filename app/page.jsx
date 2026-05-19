import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="main">
      <div className="card">
        <h1>Distribution System Demo</h1>
        <p>This app simulates lead assignment to mandatory and fair provider pools.</p>
        <div className="grid" style={{ marginTop: '24px' }}>
          <Link href="/request-service"><button>Submit Service Request</button></Link>
          <Link href="/dashboard"><button className="secondary">View Provider Dashboard</button></Link>
          <Link href="/test-tools"><button className="secondary">Test Tools</button></Link>
        </div>
      </div>
    </main>
  );
}
