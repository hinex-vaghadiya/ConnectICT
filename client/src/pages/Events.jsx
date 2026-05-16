import { useEffect, useState } from 'react';
import { useAuth, API } from '../context/AuthContext';
import { Calendar, Plus, MapPin, Users, Clock, Check } from 'lucide-react';

const typeColors = { meetup: '#7c3aed', webinar: '#06b6d4', hackathon: '#f59e0b', workshop: '#10b981', reunion: '#ec4899', other: '#94a3b8' };

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: 'Online', type: 'meetup', link: '' });

  const fetchEvents = () => {
    setLoading(true);
    API.get('/events?upcoming=true').then(r => setEvents(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async () => {
    try { await API.post('/events', form); setShowModal(false); fetchEvents(); } catch { alert('Failed to create event'); }
  };

  const handleRSVP = async (id) => {
    await API.post(`/events/${id}/rsvp`);
    fetchEvents();
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const fixUrl = (u) => u ? (u.startsWith('http') ? u : `https://${u}`) : '';

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1><Calendar size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Events</h1>
            <p>Meetups, webinars, hackathons & more</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Event</button>
        </div>

        {loading ? <div className="loading"><div className="spinner"></div></div> : events.length === 0 ? (
          <div className="empty-state"><Calendar size={48} /><h3>No upcoming events</h3><p>Create the first event!</p></div>
        ) : (
          <div className="grid-2">
            {events.map(e => {
              const isAttending = e.attendees?.some(a => (a._id || a) === user?._id);
              return (
                <div key={e._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge" style={{ background: `${typeColors[e.type]}20`, color: typeColors[e.type] }}>{e.type}</span>
                    <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {e.attendees?.length || 0} attending</div>
                    </div>
                  </div>
                  <h3 style={{ marginTop: 12, fontSize: '1.05rem' }}>{e.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 8, lineHeight: 1.5 }}>{e.description?.substring(0, 150)}{e.description?.length > 150 ? '...' : ''}</p>
                  <div style={{ display: 'flex', gap: 14, marginTop: 14, color: '#64748b', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {fmtDate(e.date)} · {fmtTime(e.date)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {e.location}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={() => handleRSVP(e._id)} className={`btn btn-sm ${isAttending ? 'btn-secondary' : 'btn-primary'}`}>
                      {isAttending ? <><Check size={14} /> Attending</> : 'RSVP'}
                    </button>
                    {e.link && <a href={fixUrl(e.link)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Join Link</a>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Create Event</h2>
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="meetup">Meetup</option><option value="webinar">Webinar</option>
                    <option value="hackathon">Hackathon</option><option value="workshop">Workshop</option>
                    <option value="reunion">Reunion</option>
                  </select>
                </div>
                <div className="form-group"><label>Date & Time</label><input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label>Meeting Link (optional)</label><input value={form.link} onChange={e => setForm({...form, link: e.target.value})} /></div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
