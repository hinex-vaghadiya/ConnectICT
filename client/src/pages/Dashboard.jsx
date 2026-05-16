import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { Users, Building2, Briefcase, BookOpen, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    API.get('/users/stats').then(r => setStats(r.data)).catch(() => {});
    API.get('/jobs?limit=3').then(r => setRecentJobs(r.data.jobs || [])).catch(() => {});
    API.get('/posts?limit=3').then(r => setRecentPosts(r.data.posts || [])).catch(() => {});
    API.get('/events?upcoming=true').then(r => setUpcomingEvents((r.data || []).slice(0, 3))).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="page">
      <div className="container">
        {/* Welcome */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))', marginBottom: 32, padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <img src={user.avatar} alt="" className="avatar avatar-lg" style={{ borderColor: '#7c3aed' }} />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
              <p style={{ color: '#94a3b8' }}>{user.currentCompany ? `${user.currentPosition} at ${user.currentCompany}` : user.profileCompleted ? `${user.role} · ${user.branch}` : 'Complete your profile to get the most out of ConnectICT'}</p>
              {!user.profileCompleted && (
                <Link to="/edit-profile" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Complete Profile <ArrowRight size={14} /></Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid-4" style={{ marginBottom: 32 }}>
            {[
              { icon: Users, label: 'ICTians', value: stats.totalUsers, color: '#7c3aed' },
              { icon: Building2, label: 'Companies', value: stats.totalCompanies, color: '#06b6d4' },
              { icon: TrendingUp, label: 'Mentors', value: stats.mentors, color: '#10b981' },
              { icon: Briefcase, label: 'Alumni', value: stats.alumni, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <s.icon size={24} style={{ color: s.color, marginBottom: 8 }} />
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Jobs */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={18} style={{ color: '#f59e0b' }} /> Latest Jobs</h3>
              <Link to="/jobs" style={{ color: '#7c3aed', fontSize: '0.85rem', fontWeight: 500 }}>View all →</Link>
            </div>
            {recentJobs.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No jobs posted yet. Be the first!</p>
            ) : recentJobs.map(j => (
              <div key={j._id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{j.title}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{j.company} · {j.type}</p>
              </div>
            ))}
          </div>

          {/* Recent Forum Posts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={18} style={{ color: '#ec4899' }} /> Forum Activity</h3>
              <Link to="/forum" style={{ color: '#7c3aed', fontSize: '0.85rem', fontWeight: 500 }}>View all →</Link>
            </div>
            {recentPosts.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No discussions yet. Start one!</p>
            ) : recentPosts.map(p => (
              <Link key={p._id} to={`/forum/${p._id}`} style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.title}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>by {p.author?.name} · {p.comments?.length || 0} comments</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} style={{ color: '#06b6d4' }} /> Upcoming Events</h3>
              <Link to="/events" style={{ color: '#7c3aed', fontSize: '0.85rem', fontWeight: 500 }}>View all →</Link>
            </div>
            <div className="grid-3">
              {upcomingEvents.map(e => (
                <div key={e._id} className="card">
                  <span className="badge badge-cyan" style={{ marginBottom: 8 }}>{e.type}</span>
                  <h4>{e.title}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
                    {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
