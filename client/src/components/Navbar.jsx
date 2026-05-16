import { Link, useLocation } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { Menu, X, Users, Building2, Briefcase, MessageSquare, Calendar, BookOpen, Shield, LogOut, Home, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const navLinks = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/people', label: 'People', icon: Users },
  { path: '/companies', label: 'Companies', icon: Building2 },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/forum', label: 'Forum', icon: BookOpen },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/events', label: 'Events', icon: Calendar },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = () => {
    API.get('/notifications').then(r => {
      setNotifications(r.data.notifications || []);
      setUnreadCount(r.data.unreadCount || 0);
    }).catch(() => {});
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const intId = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(intId);
    }
  }, [user]);

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await API.put(`/notifications/${n._id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
    }
    setShowNotifications(false);
  };

  const markAllRead = async () => {
    await API.put('/notifications/read-all');
    setUnreadCount(0);
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  if (!user || location.pathname === '/' || location.pathname.startsWith('/auth')) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-logo">
          <div className="navbar-logo-icon">C</div>
          <span className="navbar-logo-text">ConnectICT</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'navbar-links--open' : ''}`}>
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)}
              className={`navbar-link ${location.pathname === path ? 'navbar-link--active' : ''}`}>
              <Icon size={16} /><span>{label}</span>
            </Link>
          ))}
          {user.isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}
              className={`navbar-link ${location.pathname === '/admin' ? 'navbar-link--active' : ''}`}>
              <Shield size={16} /><span>Admin</span>
            </Link>
          )}
        </div>

        <div className="navbar-right">
          <div style={{ position: 'relative' }}>
            <button className="navbar-notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="navbar-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="navbar-notifications-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <Link key={n._id} to={n.link || '#'} onClick={() => handleNotificationClick(n)} className={`notification-item ${!n.read ? 'notification-item--unread' : ''}`}>
                      <img src={n.sender?.avatar || 'https://github.com/identicons/icon.png'} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700 }}>{n.sender?.name?.split(' ')[0]}</span> {n.content}
                        </p>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', marginTop: 6 }} />}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link to={`/profile/${user._id}`} className="navbar-profile">
            <img src={user.avatar} alt="" className="navbar-avatar" />
            <span className="navbar-profile-name">{user.name?.split(' ')[0]}</span>
          </Link>
          <button onClick={logout} className="navbar-logout" title="Logout"><LogOut size={18} /></button>
          <button className="navbar-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
