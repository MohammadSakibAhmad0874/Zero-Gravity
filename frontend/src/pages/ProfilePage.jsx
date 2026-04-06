import { useContext, useState } from 'react'
import { AuthContext } from '../App'
import { User, Save, MapPin, Globe, X } from 'lucide-react'
import './ProfilePage.css'

const SKILLS_OPTIONS = [
  'Music', 'Cooking', 'Photography', 'Painting', 'Dance', 'Coding',
  'Writing', 'Yoga', 'Martial Arts', 'Gardening', 'Pottery', 'Calligraphy',
  'Film Making', 'Theatre', 'Fashion Design', 'Woodworking', 'Knitting',
  'Chess', 'Mathematics', 'History', 'Philosophy', 'Science'
]

const LANGUAGES_OPTIONS = [
  'English', 'Spanish', 'Mandarin', 'Hindi', 'French', 'Arabic',
  'Portuguese', 'Russian', 'Japanese', 'Korean', 'German', 'Italian',
  'Turkish', 'Vietnamese', 'Thai', 'Swahili', 'Dutch', 'Swedish'
]

const INTERESTS_OPTIONS = [
  'Art & Music', 'Food & Cuisine', 'History & Heritage', 'Technology',
  'Sports & Fitness', 'Travel', 'Literature', 'Film & Cinema',
  'Fashion', 'Festivals & Traditions', 'Nature & Environment',
  'Spirituality', 'Architecture', 'Folklore & Mythology'
]

export default function ProfilePage() {
  const { user, token, setUser } = useContext(AuthContext)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...user })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
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

  return (
    <div className="page-container profile-page">
      <div className="section-header">
        <h1>Your Profile</h1>
        <p>Manage your cultural exchange profile</p>
      </div>

      <div className="profile-layout animate-fade-in-up">
        <div className="profile-card glass-card">
          <div className="profile-banner">
            <div className="avatar avatar-xl">{user?.name?.charAt(0)}</div>
          </div>
          <div className="profile-card-body">
            {editing ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input type="text" className="form-input" value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <div className="chips-picker">
                    {SKILLS_OPTIONS.map(s => (
                      <button key={s} type="button" className={`tag ${(form.skills || []).includes(s) ? 'tag-primary' : ''}`} onClick={() => toggleItem('skills', s)}>
                        {s} {(form.skills || []).includes(s) && <X size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Languages</label>
                  <div className="chips-picker">
                    {LANGUAGES_OPTIONS.map(l => (
                      <button key={l} type="button" className={`tag ${(form.languages || []).includes(l) ? 'tag-accent' : ''}`} onClick={() => toggleItem('languages', l)}>
                        {l} {(form.languages || []).includes(l) && <X size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cultural Interests</label>
                  <div className="chips-picker">
                    {INTERESTS_OPTIONS.map(i => (
                      <button key={i} type="button" className={`tag ${(form.interests || []).includes(i) ? 'tag-success' : ''}`} onClick={() => toggleItem('interests', i)}>
                        {i} {(form.interests || []).includes(i) && <X size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ ...user }) }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-view">
                <h2>{user?.name}</h2>
                <p className="profile-location"><MapPin size={16} /> {user?.country || 'Earth'}</p>
                {user?.bio && <p className="profile-bio-text">{user.bio}</p>}

                <div className="profile-section-block">
                  <h4>Skills</h4>
                  <div className="tags-container">
                    {(user?.skills || []).map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                    {(!user?.skills || user.skills.length === 0) && <span className="text-muted">No skills added yet</span>}
                  </div>
                </div>

                <div className="profile-section-block">
                  <h4>Languages</h4>
                  <div className="tags-container">
                    {(user?.languages || []).map(l => <span key={l} className="tag tag-accent">{l}</span>)}
                    {(!user?.languages || user.languages.length === 0) && <span className="text-muted">No languages added yet</span>}
                  </div>
                </div>

                <div className="profile-section-block">
                  <h4>Cultural Interests</h4>
                  <div className="tags-container">
                    {(user?.interests || []).map(i => <span key={i} className="tag tag-success">{i}</span>)}
                    {(!user?.interests || user.interests.length === 0) && <span className="text-muted">No interests added yet</span>}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ marginTop: '1.5rem' }} id="edit-profile-btn">
                  <User size={18} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {saved && <div className="toast toast-success">Profile updated successfully!  ✓</div>}
    </div>
  )
}
