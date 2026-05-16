import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { MapPin, GraduationCap, Building2, Code2, Star, GitFork, MessageSquare, Heart, ExternalLink, Users, X } from 'lucide-react';
import { GithubIcon as Github, LinkedinIcon as Linkedin } from '../components/Icons';
import { marked } from 'marked';


const langColors = { JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5', Java: '#b07219', 'C++': '#f34b7d', Go: '#00add8', Rust: '#dea584', HTML: '#e34c26', CSS: '#1572b6', Ruby: '#701516' };

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [tab, setTab] = useState('projects');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [readmeContent, setReadmeContent] = useState('');
  const [loadingReadme, setLoadingReadme] = useState(false);

  useEffect(() => {
    API.get(`/users/${id}`).then(r => {
      setProfile(r.data);
      setFollowersCount(r.data.followers?.length || 0);
      if (currentUser && r.data.followers) {
        setIsFollowing(r.data.followers.includes(currentUser._id));
      }
      if (r.data.username) {
        setLoadingRepos(true);
        API.get(`/github/repos/${r.data.username}`).then(rr => setRepos(rr.data)).finally(() => setLoadingRepos(false));
      }
    });
  }, [id, currentUser]);

  const handleProjectClick = (repo) => {
    setSelectedRepo(repo);
    setReadmeContent('');
    setLoadingReadme(true);
    const [owner, repoName] = repo.fullName.split('/');
    API.get(`/github/repos/${owner}/${repoName}/readme`)
      .then(r => {
        setReadmeContent(r.data);
      })
      .catch(() => {
        setReadmeContent('_No README.md documentation found for this project._');
      })
      .finally(() => {
        setLoadingReadme(false);
      });
  };

  const handleFollow = async () => {
    try {
      const res = await API.post(`/users/${profile._id}/follow`);
      setIsFollowing(res.data.isFollowing);
      setFollowersCount(res.data.followersCount);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update follow status');
    }
  };

  if (!profile) return <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;

  const isOwn = currentUser?._id === profile._id;

  return (
    <div className="page">
      <div className="container">
        {/* Profile Header */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))', marginBottom: 24, padding: 32 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <img src={profile.avatar} alt="" className="avatar avatar-xl" style={{ borderColor: 'rgba(124,58,237,0.5)' }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{profile.name}</h1>
                <span className="badge" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
                  {profile.role}
                </span>
                {profile.isMentor && <span className="badge badge-green">Mentor</span>}
              </div>
              <p style={{ color: '#94a3b8', marginTop: 4 }}>@{profile.username}</p>
              {profile.bio && <p style={{ marginTop: 10, color: '#cbd5e1', lineHeight: 1.6 }}>{profile.bio}</p>}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14, color: '#94a3b8', fontSize: '0.85rem' }}>
                {profile.currentCompany && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Building2 size={14} /> {profile.currentPosition ? `${profile.currentPosition} at ` : ''}{profile.currentCompany}</span>
                )}
                {profile.batchYear && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><GraduationCap size={14} /> Enrolled {profile.batchYear}</span>}
                {profile.branch && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} /> {profile.branch}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={14} /> {followersCount} {followersCount === 1 ? 'follower' : 'followers'}</span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><Linkedin size={14} /> LinkedIn</a>
                )}
                <a href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><Github size={14} /> GitHub</a>
                {!isOwn && (
                  <>
                    <button onClick={handleFollow} className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}>{isFollowing ? 'Following' : 'Follow'}</button>
                    <Link to={`/messages?to=${profile._id}`} className="btn btn-primary btn-sm"><MessageSquare size={14} /> Message</Link>
                  </>
                )}
                {isOwn && <Link to="/edit-profile" className="btn btn-secondary btn-sm">Edit Profile</Link>}
              </div>
            </div>
          </div>

          {profile.skills?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 20 }}>
              {profile.skills.map((s, i) => <span key={i} className="badge badge-cyan">{s}</span>)}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>
            <Code2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Projects ({repos.length})
          </button>
          {profile.isMentor && (
            <button className={`tab ${tab === 'mentorship' ? 'active' : ''}`} onClick={() => setTab('mentorship')}>
              <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Mentorship
            </button>
          )}
        </div>

        {/* Projects Tab */}
        {tab === 'projects' && (
          loadingRepos ? <div className="loading"><div className="spinner"></div></div> : repos.length === 0 ? (
            <div className="empty-state">
              <Code2 size={48} />
              <h3>No tagged projects yet</h3>
              <p>Add <code style={{ background: 'rgba(124,58,237,0.2)', padding: '2px 8px', borderRadius: 4 }}>#ConnectICT</code> to a project's README to show it here</p>
            </div>
          ) : (
            <div className="grid-2">
              {repos.map(r => (
                <div key={r.id} onClick={() => handleProjectClick(r)} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#f1f5f9' }}>{r.name}</h4>
                    <ExternalLink size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                  </div>
                  {r.description && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 8, lineHeight: 1.5 }}>{r.description}</p>}
                  <div style={{ display: 'flex', gap: 14, marginTop: 14, color: '#64748b', fontSize: '0.8rem' }}>
                    {r.language && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: langColors[r.language] || '#8b8b8b' }}></span>
                        {r.language}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={13} /> {r.stars}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><GitFork size={13} /> {r.forks}</span>
                  </div>
                  {r.topics?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                      {r.topics.slice(0, 5).map((t, i) => <span key={i} className="badge" style={{ fontSize: '0.6rem' }}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Mentorship Tab */}
        {tab === 'mentorship' && profile.isMentor && (
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Mentorship Topics</h3>
            {profile.mentorTopics?.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profile.mentorTopics.map((t, i) => <span key={i} className="badge badge-green">{t}</span>)}
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>Available for mentorship — reach out via message!</p>
            )}
          </div>
        )}

        {/* README Preview Modal */}
        {selectedRepo && (
          <div className="modal-overlay" onClick={() => setSelectedRepo(null)}>
            <div className="modal" style={{ maxWidth: 850, width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9' }}>{selectedRepo.name}</h3>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, color: '#64748b', fontSize: '0.8rem' }}>
                    {selectedRepo.language && <span>{selectedRepo.language}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={12} /> {selectedRepo.stars}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><GitFork size={12} /> {selectedRepo.forks}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <a href={selectedRepo.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ExternalLink size={14} /> Open on GitHub
                  </a>
                  <button onClick={() => setSelectedRepo(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
                </div>
              </div>
              <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                {loadingReadme ? (
                  <div className="loading" style={{ minHeight: 200 }}><div className="spinner"></div></div>
                ) : (
                  <div className="markdown-body" style={{ color: '#cbd5e1', lineHeight: 1.6, overflowWrap: 'anywhere' }} dangerouslySetInnerHTML={{ __html: marked.parse(readmeContent) }} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
