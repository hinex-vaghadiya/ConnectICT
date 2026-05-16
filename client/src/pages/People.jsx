import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { Search, Filter, Users, GraduationCap, Award } from 'lucide-react';



export default function People() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (batchYear) params.set('batchYear', batchYear);
    API.get(`/users?${params}`).then(r => {
      setUsers(r.data.users); setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, role, batchYear]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };
  const years = Array.from({ length: 15 }, (_, i) => 2015 + i);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><Users size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> People Directory</h1>
          <p>Discover and connect with ICTians across batches</p>
        </div>

        <div className="filter-bar">
          <form onSubmit={handleSearch} className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
            <Search size={18} />
            <input placeholder="Search by name, company, skills..." value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year (Masters)</option>
            <option value="5th Year">5th Year (Masters)</option>
            <option value="Alumni">Alumni</option>
          </select>
          <select value={batchYear} onChange={e => { setBatchYear(e.target.value); setPage(1); }}>
            <option value="">All Enrollment Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><Users size={48} /><h3>No users found</h3><p>Try adjusting your filters</p></div>
        ) : (
          <>
            <div className="grid-3">
              {users.map(u => (
                <Link key={u._id} to={`/profile/${u._id}`} className="card" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img src={u.avatar} alt="" className="avatar" style={{ width: 52, height: 52 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</h4>
                        <span className="badge" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontSize: '0.65rem' }}>
                          {u.role}
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>@{u.username}</p>
                    </div>
                  </div>
                  {u.currentCompany && (
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Award size={14} style={{ color: '#f59e0b' }} /> {u.currentPosition ? `${u.currentPosition} at ` : ''}{u.currentCompany}
                    </p>
                  )}
                  {u.skills?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                      {u.skills.slice(0, 4).map((s, i) => <span key={i} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{s}</span>)}
                      {u.skills.length > 4 && <span className="badge" style={{ fontSize: '0.65rem' }}>+{u.skills.length - 4}</span>}
                    </div>
                  )}
                  {u.batchYear && <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 8 }}><GraduationCap size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Enrolled {u.batchYear}</p>}
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
