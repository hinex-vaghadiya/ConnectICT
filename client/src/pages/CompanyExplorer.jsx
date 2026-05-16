import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { Building2, Users, ChevronDown, ChevronUp } from 'lucide-react';

const roleColors = { alumni: '#f59e0b', senior: '#7c3aed', junior: '#06b6d4' };

export default function CompanyExplorer() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    API.get('/users/companies').then(r => setCompanies(r.data)).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><Building2 size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Company Explorer</h1>
          <p>See where ICTians are working — browse by company</p>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : companies.length === 0 ? (
          <div className="empty-state"><Building2 size={48} /><h3>No company data yet</h3><p>Users need to add their company info</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {companies.map(c => (
              <div key={c._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button onClick={() => toggle(c._id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  padding: '20px 24px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 18, color: '#7c3aed',
                    }}>{c._id?.charAt(0)?.toUpperCase()}</div>
                    <div style={{ textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{c._id}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} /> {c.count} {c.count === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  </div>
                  {expanded[c._id] ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                </button>
                {expanded[c._id] && (
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, paddingTop: 16 }}>
                      {c.members.map(m => (
                        <Link key={m._id} to={`/profile/${m._id}`} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10,
                          background: 'rgba(255,255,255,0.03)', textDecoration: 'none',
                          border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s',
                        }}>
                          <img src={m.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</p>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: roleColors[m.role] }}>{m.role}</span>
                              {m.batchYear && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>· {m.batchYear}</span>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
