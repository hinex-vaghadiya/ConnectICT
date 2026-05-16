import { Users, Building2, Code2, Briefcase, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { GithubIcon as Github } from '../components/Icons';

const features = [
  { icon: Users, title: 'Connect', desc: 'Find and connect with alumni, seniors, and juniors from the Department of ICT', color: '#7c3aed' },
  { icon: Building2, title: 'Companies', desc: 'Explore where ICTians work — browse members grouped by companies', color: '#06b6d4' },
  { icon: Code2, title: 'Projects', desc: 'Showcase your GitHub projects tagged with #ConnectICT in your README', color: '#10b981' },
  { icon: Briefcase, title: 'Jobs', desc: 'Post and discover job opportunities shared by alumni at top companies', color: '#f59e0b' },
  { icon: MessageSquare, title: 'Mentorship', desc: 'Get guidance from experienced seniors and alumni in your field', color: '#ec4899' },
  { icon: Sparkles, title: 'Community', desc: 'Engage in discussions, events, and build lasting professional relationships', color: '#8b5cf6' },
];

export default function Landing() {
  const handleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
    window.location.href = `${backendUrl}/api/auth/github`;
  };

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBg}></div>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <Sparkles size={14} /> Department of ICT
          </div>
          <h1 style={styles.title}>
            Where <span style={styles.gradient}>ICTians</span> Connect,<br />
            Collaborate & Grow
          </h1>
          <p style={styles.subtitle}>
            The exclusive networking hub for alumni, seniors, and juniors of the Department of ICT.
            Discover where your peers work, showcase projects, find mentors, and unlock opportunities.
          </p>
          <div style={styles.heroBtns}>
            <button onClick={handleLogin} className="btn btn-primary btn-lg" style={styles.githubBtn}>
              <Github size={20} /> Sign in with GitHub
            </button>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More <ArrowRight size={16} />
            </a>
          </div>
          <div style={styles.stats}>
            <div style={styles.statItem}><span style={styles.statNum}>100+</span><span style={styles.statLabel}>ICTians</span></div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}><span style={styles.statNum}>30+</span><span style={styles.statLabel}>Companies</span></div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}><span style={styles.statNum}>50+</span><span style={styles.statLabel}>Projects</span></div>
          </div>
        </div>
        <div style={styles.heroOrb1}></div>
        <div style={styles.heroOrb2}></div>
      </section>

      {/* Features */}
      <section id="features" style={styles.features}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Everything you need to <span style={styles.gradient}>network & grow</span></h2>
          <div className="grid-3" style={{ marginTop: 40 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ animationDelay: `${i * 0.1}s`, animation: 'slideUp 0.5s ease forwards' }}>
                <div style={{ ...styles.featureIcon, background: `${f.color}20`, color: f.color }}>
                  <f.icon size={24} />
                </div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.howSection}>
        <div className="container">
          <h2 style={styles.sectionTitle}>How to showcase your <span style={styles.gradient}>projects</span></h2>
          <div className="grid-3" style={{ marginTop: 40 }}>
            {[
              { step: '01', title: 'Sign in with GitHub', desc: 'One-click authentication — no passwords needed' },
              { step: '02', title: 'Complete your profile', desc: 'Add your batch year, company, skills, and LinkedIn' },
              { step: '03', title: 'Tag your repos', desc: 'Add #ConnectICT to your project README and it auto-appears on your profile' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={styles.stepNum}>{s.step}</div>
                <h3 style={{ marginTop: 16, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>Ready to join the <span style={styles.gradient}>ICT Network</span>?</h2>
          <p style={{ color: '#94a3b8', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            Connect with fellow ICTians, discover opportunities, and build your professional network.
          </p>
          <button onClick={handleLogin} className="btn btn-primary btn-lg" style={styles.githubBtn}>
            <Github size={20} /> Get Started with GitHub
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'white' }}>C</div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>ConnectICT</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>© 2026 ConnectICT — Department of ICT. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative', overflow: 'hidden',
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '80px 24px',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.1) 0%, transparent 50%)',
  },
  heroContent: { position: 'relative', textAlign: 'center', maxWidth: 720 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 16px', borderRadius: 9999,
    background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
    fontSize: '0.85rem', fontWeight: 600, marginBottom: 24,
  },
  title: { fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 },
  gradient: { background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 32px' },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  githubBtn: { gap: 10 },
  stats: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
    marginTop: 48, padding: '20px 32px',
    background: 'rgba(255,255,255,0.03)', borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: { fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLabel: { fontSize: '0.8rem', color: '#64748b', marginTop: 2 },
  statDivider: { width: 1, height: 32, background: 'rgba(255,255,255,0.1)' },
  heroOrb1: {
    position: 'absolute', top: '20%', left: '10%',
    width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)',
    animation: 'float 6s ease-in-out infinite', pointerEvents: 'none',
  },
  heroOrb2: {
    position: 'absolute', bottom: '20%', right: '10%',
    width: 250, height: 250, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)',
    animation: 'float 8s ease-in-out infinite', pointerEvents: 'none',
  },
  features: { padding: '80px 0' },
  sectionTitle: { fontSize: '1.8rem', fontWeight: 800, textAlign: 'center' },
  featureIcon: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 },
  featureDesc: { color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 },
  howSection: { padding: '80px 0', background: 'rgba(255,255,255,0.01)' },
  stepNum: {
    fontSize: '2rem', fontWeight: 900,
    background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  cta: { padding: '80px 0' },
  footer: { padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)' },
};
