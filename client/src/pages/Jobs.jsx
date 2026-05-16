import { useEffect, useState } from 'react';
import { useAuth, API } from '../context/AuthContext';
import { Briefcase, Plus, Search, ExternalLink, X, MapPin, Clock } from 'lucide-react';

const typeColors = { 'full-time': '#10b981', 'part-time': '#06b6d4', internship: '#f59e0b', freelance: '#ec4899', contract: '#8b5cf6' };

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: '', company: '', type: 'full-time', location: 'Remote', description: '', applyLink: '', tags: '' });

  const fetchJobs = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (typeFilter) p.set('type', typeFilter);
    API.get(`/jobs?${p}`).then(r => setJobs(r.data.jobs || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [typeFilter]);

  const handlePost = async () => {
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editingJob) {
        await API.put(`/jobs/${editingJob._id}`, payload);
      } else {
        await API.post('/jobs', payload);
      }
      setShowModal(false); setEditingJob(null);
      setForm({ title: '', company: '', type: 'full-time', location: 'Remote', description: '', applyLink: '', tags: '' });
      fetchJobs();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
  };

  const handleEditClick = (job) => {
    setForm({
      title: job.title || '', company: job.company || '', type: job.type || 'full-time',
      location: job.location || 'Remote', description: job.description || '',
      applyLink: job.applyLink || '', tags: job.tags?.join(', ') || ''
    });
    setEditingJob(job);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this job post?')) {
      await API.delete(`/jobs/${id}`);
      fetchJobs();
    }
  };

  const ago = (d) => { const m = Math.floor((Date.now() - new Date(d)) / 60000); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`; };
  const fixUrl = (u) => u ? (u.startsWith('http') ? u : `https://${u}`) : '';

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1><Briefcase size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Job Board</h1>
            <p>Opportunities shared by ICTians</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingJob(null); setForm({ title: '', company: '', type: 'full-time', location: 'Remote', description: '', applyLink: '', tags: '' }); setShowModal(true); }}><Plus size={16} /> Post a Job</button>
        </div>

        <div className="filter-bar">
          <form onSubmit={e => { e.preventDefault(); fetchJobs(); }} className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
            <Search size={18} /><input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
          </form>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="full-time">Full Time</option><option value="part-time">Part Time</option>
            <option value="internship">Internship</option><option value="freelance">Freelance</option>
          </select>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : jobs.length === 0 ? (
          <div className="empty-state"><Briefcase size={48} /><h3>No jobs posted yet</h3><p>Be the first to share an opportunity!</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map(j => (
              <div key={j._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.05rem' }}>{j.title}</h3>
                      <span className="badge" style={{ background: `${typeColors[j.type]}20`, color: typeColors[j.type] }}>{j.type}</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 4 }}>{j.company}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={fixUrl(j.applyLink)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Apply <ExternalLink size={12} /></a>
                    {(j.postedBy?._id === user?._id || user?.isAdmin) && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(j)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(j._id)}><X size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: 12, lineHeight: 1.6 }}>{j.description}</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, color: '#64748b', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {j.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {ago(j.createdAt)}</span>
                  {j.postedBy && <span>Posted by {j.postedBy.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingJob(null); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>{editingJob ? 'Edit Job / Internship' : 'Post a Job / Internship'}</h2>
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Frontend Developer" /></div>
              <div className="form-row">
                <div className="form-group"><label>Company</label><input value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
                <div className="form-group"><label>Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="full-time">Full Time</option><option value="part-time">Part Time</option>
                    <option value="internship">Internship</option><option value="freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label>Apply Link</label><input value={form.applyLink} onChange={e => setForm({...form, applyLink: e.target.value})} placeholder="https://..." /></div>
              <div className="form-group"><label>Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="React, Node.js, Remote" /></div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingJob(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePost}>{editingJob ? 'Save Changes' : 'Post Job'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
