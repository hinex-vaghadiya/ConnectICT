import { useEffect, useState } from 'react';
import { API } from '../context/AuthContext';
import { Shield, Users, Briefcase, BookOpen, Calendar, CheckCircle, XCircle, Trash2, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats').then(r => setStats(r.data)),
      API.get('/admin/users').then(r => setUsers(r.data.users || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const toggleVerify = async (id, current) => {
    await API.put(`/admin/users/${id}/verify`, { isVerified: !current });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerified: !current } : u));
  };

  const toggleAdmin = async (id, current) => {
    if (!confirm(current ? 'Remove admin privileges?' : 'Grant admin privileges?')) return;
    await API.put(`/admin/users/${id}/admin`, { isAdmin: !current });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isAdmin: !current } : u));
  };

  const toggleDeactivate = async (id, currentIsActive) => {
    const action = currentIsActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    await API.put(`/admin/users/${id}/deactivate`, { isActive: !currentIsActive });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !currentIsActive } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    await API.delete(`/admin/users/${id}`);
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  if (loading) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;

  const roleMap = stats?.roleStats?.reduce((a, r) => ({ ...a, [r._id]: r.count }), {}) || {};

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><Shield size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Admin Dashboard</h1>
          <p>Manage users and monitor platform activity</p>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Manage Users ({users.length})</button>
        </div>

        {tab === 'overview' && stats && (
          <>
            <div className="grid-4" style={{ marginBottom: 32 }}>
              {[
                { icon: Users, label: 'Total Users', value: stats.users, color: '#7c3aed' },
                { icon: Briefcase, label: 'Jobs', value: stats.jobs, color: '#f59e0b' },
                { icon: BookOpen, label: 'Posts', value: stats.posts, color: '#ec4899' },
                { icon: Calendar, label: 'Events', value: stats.events, color: '#06b6d4' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <s.icon size={24} style={{ color: s.color, marginBottom: 8 }} />
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid-3" style={{ marginBottom: 32 }}>
              <div className="card">
                <h4 style={{ marginBottom: 12, color: '#94a3b8' }}>By Role</h4>
                {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni'].map(r => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ textTransform: 'capitalize' }}>{r}</span>
                    <span style={{ fontWeight: 700, color: '#7c3aed' }}>{roleMap[r] || 0}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h4 style={{ marginBottom: 12, color: '#94a3b8' }}>Recent Registrations</h4>
                {stats.recentUsers?.map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={u.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    <span style={{ flex: 1, fontSize: '0.85rem' }}>{u.name} <span style={{ color: '#64748b' }}>@{u.username}</span></span>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>{u.role}</span>
                    {u.isVerified && <CheckCircle size={14} style={{ color: '#10b981' }} />}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {['User', 'Role', 'Company', 'Verified', 'Admin', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 8px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={u.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <div><p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</p><p style={{ color: '#64748b', fontSize: '0.75rem' }}>@{u.username}</p></div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px' }}><span className="badge" style={{ fontSize: '0.7rem' }}>{u.role}</span></td>
                    <td style={{ padding: '10px 8px', color: '#94a3b8', fontSize: '0.85rem' }}>{u.currentCompany || '—'}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <button onClick={() => toggleVerify(u._id, u.isVerified)} className="btn-icon" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        {u.isVerified ? <CheckCircle size={18} style={{ color: '#10b981' }} /> : <XCircle size={18} style={{ color: '#64748b' }} />}
                      </button>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <button onClick={() => toggleAdmin(u._id, u.isAdmin)} className="btn-icon" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Star size={18} style={{ color: u.isAdmin ? '#f59e0b' : '#64748b' }} fill={u.isAdmin ? '#f59e0b' : 'none'} />
                      </button>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <button onClick={() => toggleDeactivate(u._id, u.isActive !== false)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                        {u.isActive !== false ? (
                          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Active</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.7rem' }}>Deactivated</span>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <button onClick={() => deleteUser(u._id)} className="btn-icon" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} style={{ color: '#ef4444' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
