import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { Heart, MessageCircle, ArrowLeft, Send, Trash2 } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');

  const fetchPost = () => API.get(`/posts/${id}`).then(r => setPost(r.data));
  useEffect(() => { fetchPost(); }, [id]);

  const toggleLike = async () => { await API.post(`/posts/${id}/like`); fetchPost(); };
  const addComment = async () => {
    if (!comment.trim()) return;
    await API.post(`/posts/${id}/comment`, { content: comment });
    setComment(''); fetchPost();
  };
  const deletePost = async () => {
    if (confirm('Delete this post?')) {
      await API.delete(`/posts/${id}`);
      window.history.back();
    }
  };
  const ago = (d) => { const m = Math.floor((Date.now() - new Date(d)) / 60000); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`; };

  if (!post) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;

  const isLiked = post.likes?.includes(user?._id);
  const canDelete = post.author?._id === user?._id || user?.isAdmin;

  return (
    <div className="page"><div className="container" style={{ maxWidth: 800 }}>
      <Link to="/forum" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', marginBottom: 20, fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Forum
      </Link>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Link to={`/profile/${post.author?._id}`}>
            <img src={post.author?.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          </Link>
          <div style={{ flex: 1 }}>
            <Link to={`/profile/${post.author?._id}`} style={{ fontWeight: 600 }}>{post.author?.name}</Link>
            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{ago(post.createdAt)} · {post.category}</p>
          </div>
          {canDelete && <button className="btn btn-icon" onClick={deletePost}><Trash2 size={16} style={{ color: '#ef4444' }} /></button>}
        </div>
        <h2 style={{ fontSize: '1.3rem', marginBottom: 12 }}>{post.title}</h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{post.content}</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
          <button onClick={toggleLike} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: isLiked ? '#ef4444' : '#64748b', cursor: 'pointer' }}>
            <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} /> {post.likes?.length || 0}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}><MessageCircle size={18} /> {post.comments?.length || 0}</span>
        </div>
      </div>

      <h3 style={{ marginBottom: 16 }}>Comments</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." onKeyDown={e => e.key === 'Enter' && addComment()} />
        <button className="btn btn-primary" onClick={addComment}><Send size={16} /></button>
      </div>
      {post.comments?.length === 0 ? <p style={{ color: '#64748b' }}>No comments yet</p> :
        post.comments.map((c, i) => (
          <div key={i} className="card" style={{ marginBottom: 8, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to={`/profile/${c.author?._id}`}><img src={c.author?.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /></Link>
              <div><Link to={`/profile/${c.author?._id}`} style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.author?.name}</Link>
              <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 8 }}>{ago(c.createdAt)}</span></div>
            </div>
            <p style={{ marginTop: 8, color: '#cbd5e1', fontSize: '0.9rem' }}>{c.content}</p>
          </div>
        ))
      }
    </div></div>
  );
}
