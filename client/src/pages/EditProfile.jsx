import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { Save, X } from 'lucide-react';

const skillOptions = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'Rust', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Machine Learning', 'Data Science', 'DevOps', 'Flutter', 'React Native', 'Next.js', 'Express', 'Django', 'Spring Boot', 'TensorFlow', 'PyTorch', 'Kubernetes', 'GraphQL', 'Redis', 'Firebase'];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', bio: user?.bio || '', role: user?.role || '1st Year',
    batchYear: user?.batchYear || '', branch: user?.branch || 'IT',
    currentCompany: user?.currentCompany || '', currentPosition: user?.currentPosition || '',
    linkedinUrl: user?.linkedinUrl || '', skills: user?.skills || [],
    isMentor: user?.isMentor || false, mentorTopics: user?.mentorTopics || [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [mentorInput, setMentorInput] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addSkill = (s) => { if (s && !form.skills.includes(s)) set('skills', [...form.skills, s]); setSkillInput(''); };
  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));
  const addMentorTopic = () => { if (mentorInput && !form.mentorTopics.includes(mentorInput)) set('mentorTopics', [...form.mentorTopics, mentorInput]); setMentorInput(''); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put('/users/profile', { ...form, batchYear: form.batchYear ? parseInt(form.batchYear) : undefined });
      updateUser(res.data);
      navigate(`/profile/${user._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header"><h1>Edit Profile</h1><p>Tell the ICT community about yourself</p></div>

        <div className="card">
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label>Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year (Masters)</option>
                <option value="5th Year">5th Year (Masters)</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Bio</label><textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell us about yourself..." /></div>
          <div className="form-row">
            <div className="form-group"><label>Enrollment Year (Starting Year)</label><input type="number" value={form.batchYear} onChange={e => set('batchYear', e.target.value)} placeholder="e.g. 2023" /></div>
            <div className="form-group"><label>Branch</label>
              <select value={form.branch} onChange={e => set('branch', e.target.value)}>
                <option value="IT">IT</option>
                <option value="ICT">ICT</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Current Company</label><input value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} placeholder="e.g. Google" /></div>
            <div className="form-group"><label>Position</label><input value={form.currentPosition} onChange={e => set('currentPosition', e.target.value)} placeholder="e.g. SDE-1" /></div>
          </div>
          <div className="form-group"><label>LinkedIn URL</label><input value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" /></div>

          <div className="form-group">
            <label>Skills</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {form.skills.map(s => (
                <span key={s} className="badge badge-cyan" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}>{s} <X size={12} /></span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} placeholder="Type a skill or pick below" />
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => addSkill(skillInput)}>Add</button>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {skillOptions.filter(s => !form.skills.includes(s)).slice(0, 12).map(s => (
                <button key={s} type="button" className="badge" style={{ cursor: 'pointer', border: 'none' }} onClick={() => addSkill(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="mentor" checked={form.isMentor} onChange={e => set('isMentor', e.target.checked)} style={{ width: 'auto' }} />
            <label htmlFor="mentor" style={{ margin: 0 }}>I'm available as a mentor</label>
          </div>

          {form.isMentor && (
            <div className="form-group">
              <label>Mentor Topics</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {form.mentorTopics.map(t => (
                  <span key={t} className="badge badge-green" style={{ cursor: 'pointer' }} onClick={() => set('mentorTopics', form.mentorTopics.filter(x => x !== t))}>{t} <X size={12} /></span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={mentorInput} onChange={e => setMentorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMentorTopic())} placeholder="e.g. Web Development, DSA, System Design" />
                <button className="btn btn-secondary btn-sm" type="button" onClick={addMentorTopic}>Add</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
