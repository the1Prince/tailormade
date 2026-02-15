import { useState, useEffect } from 'react';
import api from '../api/client.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-luxury-gray">Loading dashboard…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return null;

  const { kpis, ticketsByStatus, recentSignups } = data;

  const cards = [
    { label: 'Total tailors', value: kpis.totalTailors },
    { label: 'Active tailors', value: kpis.activeTailors },
    { label: 'Suspended', value: kpis.suspendedTailors },
    { label: 'Total clients', value: kpis.totalClients },
    { label: 'Total tickets', value: kpis.totalTickets },
    { label: 'Due in 3 days', value: kpis.ticketsDueSoon },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-luxury-black mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="border border-luxury-gray/20 rounded-lg p-4 bg-white"
          >
            <p className="text-luxury-gray text-sm font-medium">{label}</p>
            <p className="text-2xl font-semibold text-luxury-black mt-1">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-luxury-gray/20 rounded-lg p-4 bg-white">
          <h2 className="font-semibold text-luxury-black mb-3">Tickets by status</h2>
          <ul className="space-y-2 text-sm">
            {Object.entries(ticketsByStatus || {}).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="text-luxury-gray capitalize">{status.replace(/_/g, ' ')}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
            {Object.keys(ticketsByStatus || {}).length === 0 && (
              <li className="text-luxury-gray">No tickets yet</li>
            )}
          </ul>
        </div>
        <div className="border border-luxury-gray/20 rounded-lg p-4 bg-white">
          <h2 className="font-semibold text-luxury-black mb-3">Recent signups</h2>
          <ul className="space-y-2 text-sm">
            {(recentSignups || []).map((u) => (
              <li key={u._id} className="flex justify-between items-center">
                <span>{u.username || u.name || u.email || '—'}</span>
                <span className="text-luxury-gray text-xs">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </span>
              </li>
            ))}
            {(recentSignups || []).length === 0 && (
              <li className="text-luxury-gray">No signups yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
