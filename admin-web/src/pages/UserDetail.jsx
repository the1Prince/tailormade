import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  const suspend = async () => {
    setActionLoading('suspend');
    try {
      await api.patch(`/admin/users/${id}/suspend`, { reason: suspendReason });
      setUser((u) => ({ ...u, isSuspended: true, suspendedAt: new Date(), suspendedReason: suspendReason }));
    } finally {
      setActionLoading('');
    }
  };

  const unsuspend = async () => {
    setActionLoading('unsuspend');
    try {
      await api.patch(`/admin/users/${id}/unsuspend`);
      setUser((u) => ({ ...u, isSuspended: false, suspendedAt: null, suspendedReason: null }));
    } finally {
      setActionLoading('');
    }
  };

  const deleteUser = async () => {
    if (!confirm('Permanently delete this user and anonymise their data?')) return;
    setActionLoading('delete');
    try {
      await api.delete(`/admin/users/${id}`);
      navigate('/users');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <p className="text-luxury-gray">Loading…</p>;
  if (!user) return <p className="text-red-600">User not found</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-luxury-black">
          {user.username || user.name || user.email || 'User'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="text-sm text-luxury-gray hover:text-luxury-black"
        >
          ← Back to users
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border border-luxury-gray/20 rounded-lg p-4 bg-white">
          <h2 className="font-semibold text-luxury-black mb-3">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-luxury-gray">Username</dt><dd>{user.username || '—'}</dd></div>
            <div><dt className="text-luxury-gray">Email</dt><dd>{user.email || '—'}</dd></div>
            <div><dt className="text-luxury-gray">Name</dt><dd>{user.name || '—'}</dd></div>
            <div><dt className="text-luxury-gray">Status</dt><dd>{user.isSuspended ? 'Suspended' : 'Active'}</dd></div>
            {user.isSuspended && user.suspendedReason && (
              <div><dt className="text-luxury-gray">Reason</dt><dd>{user.suspendedReason}</dd></div>
            )}
            <div><dt className="text-luxury-gray">Clients</dt><dd>{user.clientCount ?? '—'}</dd></div>
            <div><dt className="text-luxury-gray">Tickets</dt><dd>{user.ticketCount ?? '—'}</dd></div>
            <div><dt className="text-luxury-gray">Last active</dt><dd>{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : '—'}</dd></div>
          </dl>
        </div>
        <div className="border border-luxury-gray/20 rounded-lg p-4 bg-white">
          <h2 className="font-semibold text-luxury-black mb-3">Actions</h2>
          <div className="space-y-3">
            {user.isSuspended ? (
              <button
                type="button"
                onClick={unsuspend}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-luxury-black text-white rounded text-sm font-medium disabled:opacity-50"
              >
                {actionLoading === 'unsuspend' ? '…' : 'Unsuspend account'}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Reason for suspension (optional)"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border border-luxury-gray/30 rounded text-sm mb-2"
                />
                <button
                  type="button"
                  onClick={suspend}
                  disabled={!!actionLoading}
                  className="px-4 py-2 bg-amber-600 text-white rounded text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading === 'suspend' ? '…' : 'Suspend account'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={deleteUser}
              disabled={!!actionLoading}
              className="block px-4 py-2 text-red-600 border border-red-600 rounded text-sm font-medium hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading === 'delete' ? '…' : 'Delete user'}
            </button>
          </div>
        </div>
      </div>
      <div className="border border-luxury-gray/20 rounded-lg p-4 bg-white">
        <h2 className="font-semibold text-luxury-black mb-3">Recent activity</h2>
        <ul className="space-y-2 text-sm">
          {(user.activities || []).map((a) => (
            <li key={a._id} className="flex flex-wrap gap-2 text-luxury-gray">
              <span className="font-medium text-luxury-black">{a.action}</span>
              {a.resource && <span>{a.resource}</span>}
              <span>{new Date(a.createdAt).toLocaleString()}</span>
            </li>
          ))}
          {(user.activities || []).length === 0 && <li className="text-luxury-gray">No activity</li>}
        </ul>
      </div>
    </div>
  );
}
