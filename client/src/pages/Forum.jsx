import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { BookOpen, Plus, Heart, MessageCircle, Search } from 'lucide-react';

const categories = ['all', 'general', 'placements', 'dsa', 'projects', 'college-life', 'career-advice', 'resources'];
const catColors = { general: '#94a3b8', placements: '#f59e0b', dsa: '#ef4444', projects: '#10b981', 'college-life': '#ec4899', 'career-advice': '#7c3aed', resources: '#06b6d4' };

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });

  const fetchPosts = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (category !== 'all') p.set('category', category);
    if (search) p.set('search', search);
    API.get(`/posts?${p}`).then(r => setPosts(r.data.posts || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, [category]);

  const handlePost = async () => {
    try {
      await API.post('/posts', form);
      setShowModal(false); setForm({ title: '', content: '', category: 'general' }); fetchPosts();
    } catch (err) { alert('Failed to post'); }
  };

  const toggleLike = async (id) => {
    await API.post(`/posts/${id}/like`);
    fetchPosts();
  };

  const ago = (d) => { const m = Math.floor((Date.now() - new Date(d)) / 60000); return m < 60 ? `${m}m` : m < 1440 ? `${Math.floor(m/60)}h` : `${Math.floor(m/1440)}d`; };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1><BookOpen size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Discussion Forum</h1>
            <p>Share knowledge, ask questions, help each other</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Post</button>
        </div>

        <div className="tabs">
          {categories.map(c => (
            <button key={c} className={`tab ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); }}>
              {c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <form onSubmit={e => { e.preventDefault(); fetchPosts(); }} className="search-bar" style={{ marginBottom: 24, maxWidth: 400 }}>
          <Search size={18} /><input placeholder="Search discussions..." value={search} onChange={e => setSearch(e.target.value)} />
        </form>

        {loading ? <div className="loading"><div className="spinner"></div></div> : posts.length === 0 ? (
          <div className="empty-state"><BookOpen size={48} /><h3>No posts yet</h3><p>Start the first discussion!</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map(p => (
              <Link key={p._id} to={`/forum/${p._id}`} className="card" style={{ textDecoration: 'none', padding: '16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={p.author?.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.95rem' }}>{p.title}</h4>
                      <span className="badge" style={{ background: `${catColors[p.category] || '#94a3b8'}20`, color: catColors[p.category], fontSize: '0.65rem' }}>{p.category}</span>
                      {p.isPinned && <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>Pinned</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, color: '#64748b', fontSize: '0.8rem', marginTop: 4 }}>
                      <span>{p.author?.name}</span>
                      <span>{ago(p.createdAt)} ago</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={12} /> {p.likes?.length || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={12} /> {p.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>New Discussion</h2>
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Content</label><textarea rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})} /></div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePost}>Post</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
