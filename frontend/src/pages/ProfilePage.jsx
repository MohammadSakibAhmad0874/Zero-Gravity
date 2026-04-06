import { useContext, useState } from 'react'
import { AuthContext } from '../App'
import { User, Save, MapPin, Code2, Layers, X, Globe, Settings, Heart, CheckCircle } from 'lucide-react'
import './ProfilePage.css'

const SKILLS_OPTIONS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Flask', 'Java', 'Spring Boot',
  'Go', 'Rust', 'TypeScript', 'GraphQL', 'PostgreSQL', 'MongoDB',
  'Redis', 'Docker', 'Kubernetes', 'AWS', 'Firebase', 'TensorFlow',
  'PyTorch', 'Scikit-learn', 'Flutter', 'React Native', 'Figma'
]

const TECH_STACK_OPTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++',
  'Swift', 'Kotlin', 'Dart', 'Ruby', 'PHP', 'Scala', 'R', 'MATLAB',
  'HTML/CSS', 'SQL', 'Bash/Shell', 'Solidity', 'Assembly'
]

const PROJECT_INTERESTS_OPTIONS = [
  'Web App', 'Mobile App', 'AI / ML', 'Open Source',
  'DevTools', 'FinTech', 'HealthTech', 'EdTech', 'GameDev',
  'Blockchain / Web3', 'IoT', 'AR / VR', 'Cybersecurity',
  'Social Impact', 'ClimaTech', 'SaaS', 'API / Backend'
]

const ROLE_OPTIONS = [
  'Frontend', 'Backend', 'Full Stack', 'ML / AI', 'DevOps',
  'Design', 'Mobile', 'Data Science', 'Security'
]

const EXPERIENCE_OPTIONS = [
  { value: 'beginner',     label: '🌱 Beginner (0–1 yr)' },
  { value: 'intermediate', label: '⚡ Intermediate (1–3 yrs)' },
  { value: 'advanced',     label: '🚀 Advanced (3+ yrs)' },
]

export default function ProfilePage() {
  const { user, token, setUser } = useContext(AuthContext)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ ...user })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const toggleItem = (field, item) => {
    const list = form[field] || []
    setForm({
      ...form,
      [field]: list.includes(item) ? list.filter(x => x !== item) : [...list, item]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        setForm({ ...data.user })
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const completeness = Math.round(
    (!!user?.bio + !!user?.role + !!user?.country +
     (user?.skills?.length > 0 ? 1 : 0) +
     (user?.techStack?.length > 0 ? 1 : 0)) / 5 * 100
  )

  return (
    <div className="page-container profile-page">
      <div className="section-header">
        <h1>Your Dev Profile</h1>
        <p>Manage your DevMatch developer profile to get better matches</p>
      </div>

      <div className="profile-layout animate-fade-in-up">
        {/* LEFT: Profile Card */}
        <div className="profile-card glass-card">
          <div className="profile-banner">
            <div className="avatar avatar-xl">{user?.name?.charAt(0)}</div>
          </div>

          <div className="profile-card-body">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</h2>
            <p className="profile-location">
              <MapPin size={14} /> {user?.country || 'Earth'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.4rem' }}>
              {user?.role && <span className="tag tag-primary">{user.role}</span>}
              {user?.experienceLevel && <span className="tag tag-accent">{user.experienceLevel}</span>}
            </div>

            {user?.bio && <p className="profile-bio-text">{user.bio}</p>}

            {/* Completeness bar */}
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Profile Completeness</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-rose)' }}>{completeness}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,154,158,0.15)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'var(--gradient-primary)',
                  borderRadius: 99, width: `${completeness}%`,
                  transition: 'width 0.8s ease',
                  boxShadow: '0 0 8px var(--glow-primary)'
                }} />
              </div>
            </div>

            {/* Skills preview */}
            {!editing && (
              <>
                {user?.skills?.length > 0 && (
                  <div className="profile-section-block">
                    <h4><Code2 size={12} /> Skills</h4>
                    <div className="tags-container">
                      {user.skills.slice(0, 6).map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                      {user.skills.length > 6 && <span className="tag">+{user.skills.length - 6}</span>}
                    </div>
                  </div>
                )}
                {user?.techStack?.length > 0 && (
                  <div className="profile-section-block">
                    <h4><Layers size={12} /> Stack</h4>
                    <div className="tags-container">
                      {user.techStack.slice(0, 5).map(t => <span key={t} className="tag tag-accent">{t}</span>)}
                      {user.techStack.length > 5 && <span className="tag">+{user.techStack.length - 5}</span>}
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              className="btn btn-primary"
              onClick={() => setEditing(!editing)}
              style={{ marginTop: '1.25rem', width: '100%' }}
              id="edit-profile-btn"
            >
              {editing ? <><X size={16} /> Cancel Editing</> : <><User size={16} /> Edit Profile</>}
            </button>
          </div>
        </div>

        {/* RIGHT: Edit Form Sections */}
        <div className="profile-sections">

          {editing ? (
            <>
              {/* Basic Info */}
              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><User size={18} /> Basic Info</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><MapPin size={13} /> Country</label>
                    <input type="text" className="form-input" placeholder="e.g. India, USA, UK" value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })} />
                  </div>
                </div>
                <div className="form-row" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Role</label>
                    <select className="form-input" value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="">Select role</option>
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r.toLowerCase().replace(' / ', '_').replace(/ /g, '_')}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select className="form-input" value={form.experienceLevel || 'beginner'} onChange={e => setForm({ ...form, experienceLevel: e.target.value })}>
                      {EXPERIENCE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Bio (tell teams about yourself)</label>
                  <textarea className="form-input" rows={3} placeholder="e.g. Passionate full-stack dev who loves building AI tools for developers..." value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
              </div>

              {/* Skills */}
              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><Code2 size={18} /> Skills & Frameworks</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Selected: {(form.skills || []).length} skills
                </p>
                <div className="chips-picker">
                  {SKILLS_OPTIONS.map(s => (
                    <button key={s} type="button"
                      className={`tag ${(form.skills || []).includes(s) ? 'tag-primary' : ''}`}
                      onClick={() => toggleItem('skills', s)}
                    >
                      {s} {(form.skills || []).includes(s) && <X size={10} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><Layers size={18} /> Tech Stack / Languages</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Selected: {(form.techStack || []).length} languages
                </p>
                <div className="chips-picker">
                  {TECH_STACK_OPTIONS.map(t => (
                    <button key={t} type="button"
                      className={`tag ${(form.techStack || []).includes(t) ? 'tag-accent' : ''}`}
                      onClick={() => toggleItem('techStack', t)}
                    >
                      {t} {(form.techStack || []).includes(t) && <X size={10} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Interests */}
              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><Heart size={18} /> Project Interests</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Selected: {(form.projectInterests || []).length} interests
                </p>
                <div className="chips-picker">
                  {PROJECT_INTERESTS_OPTIONS.map(i => (
                    <button key={i} type="button"
                      className={`tag ${(form.projectInterests || []).includes(i) ? 'tag-success' : ''}`}
                      onClick={() => toggleItem('projectInterests', i)}
                    >
                      {i} {(form.projectInterests || []).includes(i) && <X size={10} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save actions */}
              <div className="profile-edit-actions">
                <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ ...user }) }}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-profile-btn">
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* VIEW MODE */}
              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><Code2 size={18} /> Skills & Frameworks</h3>
                <div className="tags-container">
                  {(user?.skills || []).map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                  {(!user?.skills || user.skills.length === 0) && <span className="text-muted">No skills added yet</span>}
                </div>
              </div>

              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><Layers size={18} /> Tech Stack</h3>
                <div className="tags-container">
                  {(user?.techStack || []).map(t => <span key={t} className="tag tag-accent">{t}</span>)}
                  {(!user?.techStack || user.techStack.length === 0) && <span className="text-muted">No tech stack added yet</span>}
                </div>
              </div>

              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><Heart size={18} /> Project Interests</h3>
                <div className="tags-container">
                  {(user?.projectInterests || []).map(i => <span key={i} className="tag tag-success">{i}</span>)}
                  {(!user?.projectInterests || user.projectInterests.length === 0) && <span className="text-muted">No interests added yet</span>}
                </div>
              </div>

              <div className="glass-card profile-section-panel">
                <h3 className="profile-section-title"><Settings size={18} /> Settings</h3>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Email cannot be changed. Use Google OAuth to link accounts.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {saved && (
        <div className="toast toast-success">
          <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.4rem' }} />
          Profile updated successfully!
        </div>
      )}
    </div>
  )
}
