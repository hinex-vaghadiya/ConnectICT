import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(params.get('to') || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = () => {
    API.get('/messages/conversations').then(r => setConversations(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (activeChat) {
      API.get(`/messages/${activeChat}`).then(r => setMessages(r.data || []));
      API.get(`/users/${activeChat}`).then(r => setChatUser(r.data));
      const interval = setInterval(() => {
        API.get(`/messages/${activeChat}`).then(r => setMessages(r.data || []));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    await API.post('/messages', { receiver: activeChat, content: input });
    setInput('');
    API.get(`/messages/${activeChat}`).then(r => setMessages(r.data || []));
    fetchConversations();
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><MessageSquare size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Messages</h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, height: 'calc(100vh - 200px)', minHeight: 500 }}>
          {/* Sidebar */}
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '0.95rem' }}>Conversations</h3>
            </div>
            {loading ? <div className="loading" style={{ padding: 20 }}><div className="spinner"></div></div> :
              conversations.length === 0 ? <p style={{ padding: 20, color: '#64748b', fontSize: '0.85rem' }}>No conversations yet</p> :
              conversations.map(c => (
                <button key={c.contact?._id} onClick={() => setActiveChat(c.contact?._id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%',
                  background: activeChat === c.contact?._id ? 'rgba(124,58,237,0.1)' : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', color: 'inherit', textAlign: 'left',
                }}>
                  <img src={c.contact?.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.contact?.name}</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.lastMessage?.content}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span style={{ background: '#7c3aed', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            }
          </div>

          {/* Chat Area */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            {!activeChat ? (
              <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <MessageSquare size={48} /><h3>Select a conversation</h3><p>or visit a profile to start messaging</p>
              </div>
            ) : (
              <>
                {chatUser && (
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link to={`/profile/${chatUser._id}`}><img src={chatUser.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} /></Link>
                    <Link to={`/profile/${chatUser._id}`} style={{ fontWeight: 600, fontSize: '0.9rem' }}>{chatUser.name}</Link>
                  </div>
                )}
                <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {messages.map((m, i) => {
                    const isMine = m.sender === user?._id || m.sender?._id === user?._id;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '70%', padding: '10px 14px', borderRadius: 12,
                          background: isMine ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.06)',
                          borderBottomRightRadius: isMine ? 4 : 12,
                          borderBottomLeftRadius: isMine ? 12 : 4,
                        }}>
                          <p style={{ fontSize: '0.9rem' }}>{m.content}</p>
                          <p style={{ fontSize: '0.65rem', color: isMine ? 'rgba(255,255,255,0.5)' : '#64748b', marginTop: 4, textAlign: 'right' }}>{formatTime(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
                  <button className="btn btn-primary" onClick={sendMessage}><Send size={16} /></button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
