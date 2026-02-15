import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [suspended, setSuspended] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit };
    if (suspended === 'true') params.suspended = 'true';
    if (suspended === 'false') params.suspended = 'false';
    if (search.trim()) params.search = search.trim();
    api.get('/admin/users', { params })
      .then(({ data }) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, suspended, search]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-luxury-black mb-6">User management</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="search"
          placeholder="Search by username, name or email"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-luxury-gray/30 rounded bg-white font-serif max-w-xs"
        />
        <select
          value={suspended}
          onChange={(e) => { setSuspended(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-luxury-gray/30 rounded bg-white font-serif"
        >
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Suspended</option>
        </select>
      </div>
      {loading ? (
        <p className="text-luxury-gray">Loading…</p>
      ) : (
        <>
          <div className="border border-luxury-gray/20 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-luxury-gray/20 bg-luxury-white">
                  <th className="p-3 font-semibold">Username</th>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Last active</th>
                  <th className="p-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-luxury-gray/10 hover:bg-luxury-white/50">
                    <td className="p-3">{u.username || '—'}</td>
                    <td className="p-3">{u.name || '—'}</td>
                    <td className="p-3">{u.email || '—'}</td>
                    <td className="p-3">
                      {u.isSuspended ? (
                        <span className="text-amber-600 font-medium">Suspended</span>
                      ) : (
                        <span className="text-luxury-gray">Active</span>
                      )}
                    </td>
                    <td className="p-3 text-luxury-gray">
                      {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/users/${u._id}`}
                        className="text-luxury-black font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-luxury-gray">
            <span>
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="gap-2 flex">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="disabled:opacity-50 hover:underline"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="disabled:opacity-50 hover:underline"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
