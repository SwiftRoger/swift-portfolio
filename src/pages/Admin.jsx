import { useState, useEffect } from 'react'
import api, { setAuthToken } from '../utils/api'

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  lockScreen: { minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lockCard: { background: '#0a0a12', border: '1px solid #1a1a2e', padding: '3rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  lockLabel: { fontFamily: 'monospace', fontSize: '0.7rem', color: '#4fc3f7', letterSpacing: '0.2em' },
  lockTitle: { fontFamily: 'monospace', fontSize: '2rem', color: '#e8e8e0', letterSpacing: '0.1em' },
  lockSub: { fontFamily: 'monospace', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' },
  lockError: { fontFamily: 'monospace', fontSize: '0.8rem', color: '#c62828', letterSpacing: '0.1em' },
  container: { minHeight: '100vh', background: '#000', position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #0d1117' },
  logo: { fontFamily: 'monospace', fontSize: '1rem', color: '#4fc3f7', letterSpacing: '0.2em' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  success: { fontFamily: 'monospace', fontSize: '0.8rem', color: '#44ff88', letterSpacing: '0.1em' },
  logoutBtn: { background: 'transparent', border: '1px solid #333', color: '#888', fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.15em', padding: '0.4rem 1rem', cursor: 'pointer' },
  backBtn: { fontFamily: 'monospace', fontSize: '0.75rem', color: '#888', letterSpacing: '0.15em', textDecoration: 'none' },
  body: { display: 'flex', minHeight: 'calc(100vh - 73px)' },
  sidebar: { width: '210px', borderRight: '1px solid #0d1117', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 },
  main: { flex: 1, padding: '3rem', overflowY: 'auto' },
  section: { maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  sectionTitle: { fontFamily: 'monospace', fontSize: '1.4rem', color: '#e8e8e0', letterSpacing: '0.1em', marginBottom: '0.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontFamily: 'monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '0.2em' },
  input: { background: '#0a0a12', border: '1px solid #1a1a2e', color: '#e8e8e0', fontFamily: 'monospace', fontSize: '0.9rem', padding: '0.75rem 1rem', outline: 'none', width: '100%' },
  textarea: { resize: 'vertical', lineHeight: 1.7 },
  fileInput: { fontFamily: 'monospace', fontSize: '0.8rem', color: '#888', cursor: 'pointer' },
  pfpPreview: { width: '120px', height: '120px', objectFit: 'cover', border: '1px solid #1a1a2e', marginBottom: '0.5rem' },
  primaryBtn: { background: '#4fc3f7', border: 'none', color: '#000', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.2em', padding: '0.9rem 2rem', cursor: 'pointer', alignSelf: 'flex-start' },
  secondaryBtn: { background: 'transparent', border: '1px solid #4fc3f7', color: '#4fc3f7', fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.15em', padding: '0.6rem 1.4rem', cursor: 'pointer', alignSelf: 'flex-start' },
  dangerBtn: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.15em', padding: '0.6rem 1.4rem', cursor: 'pointer', alignSelf: 'flex-start' },
  itemGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginTop: '1rem' },
  itemCard: { background: '#0a0a12', border: '1px solid #1a1a2e' },
  itemImg: { width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' },
  itemFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem' },
  itemTitle: { fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' },
  deleteBtn: { background: 'transparent', border: '1px solid #c62828', color: '#c62828', fontFamily: 'monospace', fontSize: '0.6rem', padding: '0.2rem 0.5rem', cursor: 'pointer' },
  itemList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' },
  row: { background: '#0a0a12', border: '1px solid #1a1a2e', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  tag: { fontFamily: 'monospace', fontSize: '0.6rem', color: '#4fc3f7', border: '1px solid #4fc3f7', padding: '0.15rem 0.5rem', letterSpacing: '0.1em' },
  divider: { borderTop: '1px solid #0d1117', margin: '0.5rem 0' },
  hint: { fontFamily: 'monospace', fontSize: '0.65rem', color: '#444', letterSpacing: '0.1em', lineHeight: 1.7 },
}

const TABS = [
  { id: 'bio',     label: '01 — BIO' },
  { id: 'art',     label: '02 — ART' },
  { id: 'videos',  label: '03 — VIDEO' },
  { id: 'design',  label: '04 — DESIGN' },
  { id: 'story',   label: '05 — STORY' },
  { id: 'index',   label: '06 — INDEX' },
  { id: 'world',   label: '07 — WORLD' },
]

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [tab, setTab] = useState('bio')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  // Bio
  const [bio, setBio] = useState({ name: 'Swift Caulfield', role: 'Artist / Illustrator', bio_text: '', tags: '', pfp_url: '' })

  // Art / Video / Design
  const [artItems, setArtItems] = useState([])
  const [videoItems, setVideoItems] = useState([])
  const [designItems, setDesignItems] = useState([])
  const [videoForm, setVideoForm] = useState({ title: '', url: '' })

  // Story / Chapters
  const [chapters, setChapters] = useState([])
  const [chapterForm, setChapterForm] = useState({ title: '', subtitle: '', content: '', chapter_order: 1, published: false })
  const [editingChapter, setEditingChapter] = useState(null)

  // Characters / Index
  const [characters, setCharacters] = useState([])
  const [charForm, setCharForm] = useState({ name: '', role: '', lore: '', type: 'original', story_ref: '', first_appearance: '' })
  const [editingChar, setEditingChar] = useState(null)

  // World
  const [worldEvents, setWorldEvents] = useState([])
  const [worldLocations, setWorldLocations] = useState([])
  const [locForm, setLocForm] = useState({ name: '', description: '', x_percent: 50, y_percent: 50, type: 'city' })
  const [refreshing, setRefreshing] = useState(false)

  const [eventForm, setEventForm] = useState({
  headline: '',
  summary: '',
  location_name: '',
  x_percent: 50,
  y_percent: 50,
  realm: 'middle',
  source_type: 'manual'
})

const [editingEvent, setEditingEvent] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('portfolio_token')
    if (token) { setAuthToken(token); setUnlocked(true); fetchAll() }
  }, [])

  const fetchAll = async () => {
    try {
      const [bioRes, artRes, videoRes, designRes, chapRes, charRes, evRes, locRes] = await Promise.all([
        api.get('/api/bio'),
        api.get('/api/art'),
        api.get('/api/videos'),
        api.get('/api/design'),
        api.get('/api/chapters'),
        api.get('/api/characters'),
        api.get('/api/world/events'),
        api.get('/api/world/locations'),
      ])
      if (bioRes.data) setBio(bioRes.data)
      setArtItems(artRes.data || [])
      setVideoItems(videoRes.data || [])
      setDesignItems(designRes.data || [])
      setChapters(chapRes.data || [])
      setCharacters(charRes.data || [])
      setWorldEvents(evRes.data || [])
      setWorldLocations(locRes.data || [])
    } catch (err) { console.error(err) }
  }

  const handleLogin = async () => {
    try {
      const res = await api.post('/api/auth/login', { password: passwordInput })
      setAuthToken(res.data.token)
      setUnlocked(true)
      fetchAll()
    } catch { setPasswordError(true) }
  }

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  // ── BIO ──
  const handleBioSave = async () => {
    setSaving(true)
    try { await api.put('/api/bio', bio); showSuccess('Bio saved!') }
    catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handlePfpUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try { const res = await api.post('/api/bio/pfp', { image: reader.result }); setBio(p => ({ ...p, pfp_url: res.data.url })); showSuccess('PFP uploaded!') }
      catch (err) { console.error(err) }
    }
    reader.readAsDataURL(file)
  }

  // ── ART / DESIGN ──
  const handleImageUpload = (endpoint, setter) => async (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try { const res = await api.post(endpoint, { image: reader.result, title: file.name }); setter(p => [res.data, ...p]); showSuccess('Uploaded!') }
      catch (err) { console.error(err) }
    }
    reader.readAsDataURL(file)
  }

  const handleAddVideo = async () => {
    if (!videoForm.title || !videoForm.url) return
    try { const res = await api.post('/api/videos', { title: videoForm.title, youtube_url: videoForm.url }); setVideoItems(p => [res.data, ...p]); setVideoForm({ title: '', url: '' }); showSuccess('Video added!') }
    catch (err) { console.error(err) }
  }

  const handleDelete = async (type, id) => {
    try {
      await api.delete(`/api/${type}/${id}`)
      if (type === 'art') setArtItems(p => p.filter(i => i.id !== id))
      if (type === 'videos') setVideoItems(p => p.filter(i => i.id !== id))
      if (type === 'design') setDesignItems(p => p.filter(i => i.id !== id))
      showSuccess('Deleted!')
    } catch (err) { console.error(err) }
  }

  // ── CHAPTERS ──
  const handleSaveChapter = async () => {
    setSaving(true)
    try {
      if (editingChapter) {
        const res = await api.put(`/api/chapters/${editingChapter.id}`, chapterForm)
        setChapters(p => p.map(c => c.id === editingChapter.id ? res.data : c))
        setEditingChapter(null)
      } else {
        const res = await api.post('/api/chapters', chapterForm)
        setChapters(p => [...p, res.data])
      }
      setChapterForm({ title: '', subtitle: '', content: '', chapter_order: chapters.length + 1, published: false })
      showSuccess('Chapter saved!')
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleChapterCover = async (id, e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try { await api.post(`/api/chapters/${id}/cover`, { image: reader.result }); showSuccess('Cover uploaded!') }
      catch (err) { console.error(err) }
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteChapter = async (id) => {
    try { await api.delete(`/api/chapters/${id}`); setChapters(p => p.filter(c => c.id !== id)); showSuccess('Deleted!') }
    catch (err) { console.error(err) }
  }

  const startEditChapter = (ch) => {
    setEditingChapter(ch)
    setChapterForm({ title: ch.title, subtitle: ch.subtitle || '', content: ch.content || '', chapter_order: ch.chapter_order, published: ch.published })
  }

  // ── CHARACTERS ──
  const handleSaveChar = async () => {
    setSaving(true)
    try {
      if (editingChar) {
        const res = await api.put(`/api/characters/${editingChar.id}`, charForm)
        setCharacters(p => p.map(c => c.id === editingChar.id ? res.data : c))
        setEditingChar(null)
      } else {
        const res = await api.post('/api/characters', charForm)
        setCharacters(p => [res.data, ...p])
      }
      setCharForm({ name: '', role: '', lore: '', type: 'original', story_ref: '', first_appearance: '' })
      showSuccess('Character saved!')
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleCharImage = async (id, e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try { await api.post(`/api/characters/${id}/image`, { image: reader.result }); showSuccess('Image uploaded!') }
      catch (err) { console.error(err) }
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteChar = async (id) => {
    try { await api.delete(`/api/characters/${id}`); setCharacters(p => p.filter(c => c.id !== id)); showSuccess('Deleted!') }
    catch (err) { console.error(err) }
  }

  // ── WORLD ──
  const handleWorldRefresh = async () => {
    setRefreshing(true)
    try { const res = await api.post('/api/world/refresh', {}); setWorldEvents(res.data.events || []); showSuccess('World updated with AI events!') }
    catch (err) { console.error(err); showSuccess('Groq refresh failed — check API key') }
    finally { setRefreshing(false) }
  }

  const handleSaveEvent = async () => {
  setSaving(true)

  try {
    if (editingEvent) {
      const res = await api.put(
        `/api/world/events/${editingEvent.id}`,
        eventForm
      )

      setWorldEvents(prev =>
        prev.map(event =>
          event.id === editingEvent.id ? res.data : event
        )
      )

      setEditingEvent(null)
    } else {
      const res = await api.post('/api/world/events', eventForm)

      setWorldEvents(prev => [res.data, ...prev])
    }

    setEventForm({
      headline: '',
      summary: '',
      location_name: '',
      x_percent: 50,
      y_percent: 50,
      realm: 'middle',
      source_type: 'manual'
    })

    showSuccess('Event saved!')
  } catch (err) {
    console.error(err)
  } finally {
    setSaving(false)
  }
}

const handleDeleteEvent = async (id) => {
  try {
    await api.delete(`/api/world/events/${id}`)

    setWorldEvents(prev =>
      prev.filter(event => event.id !== id)
    )

    showSuccess('Deleted!')
  } catch (err) {
    console.error(err)
  }
}

  const handleAddLocation = async () => {
    if (!locForm.name) return
    try { const res = await api.post('/api/world/locations', locForm); setWorldLocations(p => [...p, res.data]); setLocForm({ name: '', description: '', x_percent: 50, y_percent: 50, type: 'city' }); showSuccess('Location added!') }
    catch (err) { console.error(err) }
  }

  const handleDeleteLocation = async (id) => {
    try { await api.delete(`/api/world/locations/${id}`); setWorldLocations(p => p.filter(l => l.id !== id)); showSuccess('Deleted!') }
    catch (err) { console.error(err) }
  }

  // ── LOGIN SCREEN ──
  if (!unlocked) return (
    <div style={s.lockScreen}>
      <div style={s.lockCard}>
        <p style={s.lockLabel}>// RESTRICTED ACCESS</p>
        <h2 style={s.lockTitle}>ADMIN PANEL</h2>
        <p style={s.lockSub}>Enter access code to continue</p>
        <input style={s.input} type='password' value={passwordInput}
          onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder='Enter password' autoFocus />
        {passwordError && <p style={s.lockError}>// ACCESS DENIED</p>}
        <button style={s.primaryBtn} onClick={handleLogin}>UNLOCK</button>
      </div>
    </div>
  )

  return (
    <div style={s.container}>
      <header style={s.header}>
        <h1 style={s.logo}>// ADMIN PANEL</h1>
        <div style={s.headerRight}>
          {success && <p style={s.success}>{success}</p>}
          <button style={s.logoutBtn} onClick={() => { setAuthToken(null); setUnlocked(false) }}>LOGOUT</button>
          <a href='/' style={s.backBtn}>← BACK TO SITE</a>
        </div>
      </header>

      <div style={s.body}>
        {/* Sidebar */}
        <nav style={s.sidebar}>
          {TABS.map(t => (
            <button key={t.id} style={{ ...s.logoutBtn, textAlign: 'left', borderColor: tab === t.id ? '#4fc3f7' : '#1a1a2e', color: tab === t.id ? '#4fc3f7' : '#888' }} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        <main style={s.main}>

          {/* ── BIO ── */}
          {tab === 'bio' && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>EDIT BIO</h2>
              <div style={s.field}>
                <label style={s.label}>PROFILE PICTURE</label>
                {bio.pfp_url && <img src={bio.pfp_url} alt='pfp' style={s.pfpPreview} />}
                <input type='file' accept='image/*' onChange={handlePfpUpload} style={s.fileInput} />
              </div>
              {[['NAME', 'name'], ['ROLE', 'role'], ['TAGS (comma separated)', 'tags']].map(([lbl, key]) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>{lbl}</label>
                  <input style={s.input} value={bio[key] || ''} onChange={e => setBio({ ...bio, [key]: e.target.value })} />
                </div>
              ))}
              <div style={s.field}>
                <label style={s.label}>BIO TEXT</label>
                <textarea style={{ ...s.input, ...s.textarea }} value={bio.bio_text || ''} onChange={e => setBio({ ...bio, bio_text: e.target.value })} rows={6} />
              </div>
              <button style={{ ...s.primaryBtn, opacity: saving ? 0.6 : 1 }} onClick={handleBioSave} disabled={saving}>
                {saving ? 'SAVING...' : 'SAVE BIO'}
              </button>
            </div>
          )}

          {/* ── ART ── */}
          {tab === 'art' && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>MANAGE ART</h2>
              <div style={s.field}>
                <label style={s.label}>UPLOAD ART PIECE</label>
                <input type='file' accept='image/*' onChange={handleImageUpload('/api/art', setArtItems)} style={s.fileInput} />
              </div>
              <div style={s.itemGrid}>
                {artItems.map(item => (
                  <div key={item.id} style={s.itemCard}>
                    <img src={item.image_url} alt={item.title} style={s.itemImg} />
                    <div style={s.itemFooter}>
                      <p style={s.itemTitle}>{item.title}</p>
                      <button style={s.deleteBtn} onClick={() => handleDelete('art', item.id)}>DEL</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── VIDEO ── */}
          {tab === 'videos' && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>MANAGE VIDEOS</h2>
              <div style={s.field}><label style={s.label}>TITLE</label><input style={s.input} value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} placeholder='My Process Video' /></div>
              <div style={s.field}><label style={s.label}>YOUTUBE URL</label><input style={s.input} value={videoForm.url} onChange={e => setVideoForm({ ...videoForm, url: e.target.value })} placeholder='https://youtube.com/watch?v=...' /></div>
              <button style={s.primaryBtn} onClick={handleAddVideo}>ADD VIDEO</button>
              <div style={s.itemList}>
                {videoItems.map(item => (
                  <div key={item.id} style={s.row}>
                    <p style={{ ...s.itemTitle, maxWidth: '200px' }}>{item.title}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#4fc3f7', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.youtube_url}</p>
                    <button style={s.deleteBtn} onClick={() => handleDelete('videos', item.id)}>DEL</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DESIGN ── */}
          {tab === 'design' && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>MANAGE DESIGNS</h2>
              <div style={s.field}>
                <label style={s.label}>UPLOAD DESIGN</label>
                <input type='file' accept='image/*' onChange={handleImageUpload('/api/design', setDesignItems)} style={s.fileInput} />
              </div>
              <div style={s.itemGrid}>
                {designItems.map(item => (
                  <div key={item.id} style={s.itemCard}>
                    <img src={item.image_url} alt={item.title} style={s.itemImg} />
                    <div style={s.itemFooter}>
                      <p style={s.itemTitle}>{item.title}</p>
                      <button style={s.deleteBtn} onClick={() => handleDelete('design', item.id)}>DEL</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STORY / CHAPTERS ── */}
          {tab === 'story' && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>{editingChapter ? 'EDIT CHAPTER' : 'NEW CHAPTER'}</h2>
              {[['TITLE', 'title'], ['SUBTITLE', 'subtitle'], ['CHAPTER ORDER (number)', 'chapter_order']].map(([lbl, key]) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>{lbl}</label>
                  <input style={s.input} value={chapterForm[key]} onChange={e => setChapterForm({ ...chapterForm, [key]: key === 'chapter_order' ? Number(e.target.value) : e.target.value })} />
                </div>
              ))}
              <div style={s.field}>
                <label style={s.label}>CONTENT</label>
                <textarea style={{ ...s.input, ...s.textarea }} value={chapterForm.content} onChange={e => setChapterForm({ ...chapterForm, content: e.target.value })} rows={10} placeholder='Write the chapter content here...' />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type='checkbox' id='pub' checked={chapterForm.published} onChange={e => setChapterForm({ ...chapterForm, published: e.target.checked })} />
                <label htmlFor='pub' style={s.label}>PUBLISHED (visible to readers)</label>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={{ ...s.primaryBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSaveChapter} disabled={saving}>{saving ? 'SAVING...' : editingChapter ? 'UPDATE CHAPTER' : 'CREATE CHAPTER'}</button>
                {editingChapter && <button style={s.secondaryBtn} onClick={() => { setEditingChapter(null); setChapterForm({ title: '', subtitle: '', content: '', chapter_order: chapters.length + 1, published: false }) }}>CANCEL</button>}
              </div>

              <div style={s.divider} />
              <h3 style={{ ...s.label, fontSize: '0.8rem', color: '#e8e8e0' }}>EXISTING CHAPTERS</h3>
              <div style={s.itemList}>
                {chapters.map(ch => (
                  <div key={ch.id} style={s.row}>
                    <span style={s.tag}>CH.{String(ch.chapter_order).padStart(2,'0')}</span>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#e8e8e0', flex: 1 }}>{ch.title}</p>
                    <span style={{ ...s.tag, color: ch.published ? '#44ff88' : '#888', borderColor: ch.published ? '#44ff88' : '#444' }}>{ch.published ? 'LIVE' : 'DRAFT'}</span>
                    <div style={s.field}>
                      <label style={{ ...s.label, fontSize: '0.55rem' }}>COVER</label>
                      <input type='file' accept='image/*' onChange={e => handleChapterCover(ch.id, e)} style={{ ...s.fileInput, fontSize: '0.6rem' }} />
                    </div>
                    <button style={s.secondaryBtn} onClick={() => startEditChapter(ch)}>EDIT</button>
                    <button style={s.deleteBtn} onClick={() => handleDeleteChapter(ch.id)}>DEL</button>
                  </div>
                ))}
                {chapters.length === 0 && <p style={s.hint}>// No chapters yet. Create your first one above.</p>}
              </div>
            </div>
          )}

          {/* ── INDEX / CHARACTERS ── */}
          {tab === 'index' && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>{editingChar ? 'EDIT CHARACTER' : 'NEW CHARACTER'}</h2>
              {[['NAME', 'name'], ['ROLE / TITLE', 'role'], ['STORY REFERENCE', 'story_ref'], ['FIRST APPEARANCE', 'first_appearance']].map(([lbl, key]) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>{lbl}</label>
                  <input style={s.input} value={charForm[key]} onChange={e => setCharForm({ ...charForm, [key]: e.target.value })} />
                </div>
              ))}
              <div style={s.field}>
                <label style={s.label}>LORE / DESCRIPTION</label>
                <textarea style={{ ...s.input, ...s.textarea }} value={charForm.lore} onChange={e => setCharForm({ ...charForm, lore: e.target.value })} rows={4} />
              </div>
              <div style={s.field}>
                <label style={s.label}>TYPE</label>
                <select style={s.input} value={charForm.type} onChange={e => setCharForm({ ...charForm, type: e.target.value })}>
                  <option value='original'>Original Character (OC)</option>
                  <option value='commissioned'>Commissioned (CM)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={{ ...s.primaryBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSaveChar} disabled={saving}>{saving ? 'SAVING...' : editingChar ? 'UPDATE CHARACTER' : 'ADD CHARACTER'}</button>
                {editingChar && <button style={s.secondaryBtn} onClick={() => { setEditingChar(null); setCharForm({ name: '', role: '', lore: '', type: 'original', story_ref: '', first_appearance: '' }) }}>CANCEL</button>}
              </div>

              <div style={s.divider} />
              <h3 style={{ ...s.label, fontSize: '0.8rem', color: '#e8e8e0' }}>CHARACTER ROSTER</h3>
              <div style={s.itemGrid}>
                {characters.map(char => (
                  <div key={char.id} style={s.itemCard}>
                    {char.image_url
                      ? <img src={char.image_url} alt={char.name} style={s.itemImg} />
                      : <div style={{ ...s.itemImg, background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ ...s.hint, fontSize: '0.55rem' }}>NO IMAGE</p></div>
                    }
                    <div style={{ padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#e8e8e0' }}>{char.name}</p>
                      <p style={s.itemTitle}>{char.role}</p>
                      <div style={s.field}>
                        <label style={{ ...s.label, fontSize: '0.55rem' }}>UPLOAD IMAGE</label>
                        <input type='file' accept='image/*' onChange={e => handleCharImage(char.id, e)} style={{ ...s.fileInput, fontSize: '0.6rem' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button style={{ ...s.secondaryBtn, padding: '0.2rem 0.5rem', fontSize: '0.6rem' }} onClick={() => { setEditingChar(char); setCharForm({ name: char.name, role: char.role, lore: char.lore, type: char.type, story_ref: char.story_ref, first_appearance: char.first_appearance }) }}>EDIT</button>
                        <button style={{ ...s.deleteBtn, fontSize: '0.6rem' }} onClick={() => handleDeleteChar(char.id)}>DEL</button>
                      </div>
                    </div>
                  </div>
                ))}
                {characters.length === 0 && <p style={s.hint}>// No characters yet.</p>}
              </div>
            </div>
          )}

          {tab === 'world' && (
  <div style={s.section}>
    <h2 style={s.sectionTitle}>WORLD CONTROL</h2>

    {/* AI Refresh */}
    <div style={{ background: '#0a0a12', border: '1px solid #1a1a2e', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ ...s.label, color: '#4fc3f7' }}>// AI EVENT GENERATOR (GROQ)</p>
      <p style={s.hint}>Fetches real-world news and rewrites it as lore events in the Land of Three.</p>
      <button style={{ ...s.primaryBtn, opacity: refreshing ? 0.6 : 1, background: refreshing ? '#333' : '#4fc3f7' }} onClick={handleWorldRefresh} disabled={refreshing}>
        {refreshing ? 'GENERATING...' : '⚡ REFRESH WORLD NOW'}
      </button>
    </div>

    <div style={s.divider} />

    {/* Manual Event Form */}
    <h3 style={{ ...s.label, fontSize: '0.8rem', color: '#e8e8e0' }}>
      {editingEvent ? 'EDIT EVENT' : 'NEW MANUAL EVENT'}
    </h3>

    <div style={s.field}>
      <label style={s.label}>HEADLINE</label>
      <input style={s.input} value={eventForm.headline} onChange={e => setEventForm(p => ({ ...p, headline: e.target.value }))} placeholder='A great war stirs in the north...' />
    </div>

    <div style={s.field}>
      <label style={s.label}>SUMMARY</label>
      <textarea style={{ ...s.input, ...s.textarea }} rows={4} value={eventForm.summary} onChange={e => setEventForm(p => ({ ...p, summary: e.target.value }))} placeholder='Describe the event in detail...' />
    </div>

    <div style={s.field}>
      <label style={s.label}>LOCATION NAME</label>
      <input style={s.input} value={eventForm.location_name} onChange={e => setEventForm(p => ({ ...p, location_name: e.target.value }))} placeholder='e.g. Ironhold Fortress' />
    </div>

    <div style={s.field}>
      <label style={s.label}>REALM</label>
      <select style={s.input} value={eventForm.realm} onChange={e => {
        const val = e.target.value
        const yMap = { north: 20, middle: 50, south: 78 }
        setEventForm(p => ({ ...p, realm: val, y_percent: yMap[val] || p.y_percent }))
      }}>
        <option value='north'>The Ashen North</option>
        <option value='middle'>The Verdant Middle</option>
        <option value='south'>The Sunken South</option>
      </select>
    </div>

    <div style={s.field}>
      <label style={s.label}>X POSITION — {eventForm.x_percent}%</label>
      <input type='range' min={5} max={95} value={eventForm.x_percent}
        onChange={e => setEventForm(p => ({ ...p, x_percent: Number(e.target.value) }))}
        style={{ width: '100%', accentColor: '#4fc3f7' }} />
    </div>

    <div style={s.field}>
      <label style={s.label}>Y POSITION — {eventForm.y_percent}%</label>
      <input type='range' min={5} max={95} value={eventForm.y_percent}
        onChange={e => setEventForm(p => ({ ...p, y_percent: Number(e.target.value) }))}
        style={{ width: '100%', accentColor: '#4fc3f7' }} />
    </div>

    <div style={s.field}>
      <label style={s.label}>SOURCE TYPE</label>
      <select style={s.input} value={eventForm.source_type} onChange={e => setEventForm(p => ({ ...p, source_type: e.target.value }))}>
        <option value='manual'>Manual (Canon)</option>
        <option value='ai'>AI (Ambient)</option>
        <option value='system'>System</option>
      </select>
    </div>

    <div style={{ display: 'flex', gap: '1rem' }}>
      <button style={{ ...s.primaryBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSaveEvent} disabled={saving}>
        {saving ? 'SAVING...' : editingEvent ? 'UPDATE EVENT' : 'CREATE EVENT'}
      </button>
      {editingEvent && (
        <button style={s.secondaryBtn} onClick={() => {
          setEditingEvent(null)
          setEventForm({ headline: '', summary: '', location_name: '', x_percent: 50, y_percent: 50, realm: 'middle', source_type: 'manual' })
        }}>CANCEL</button>
      )}
    </div>

    <div style={s.divider} />

    {/* Current Events List */}
    <h3 style={{ ...s.label, fontSize: '0.8rem', color: '#e8e8e0' }}>
      WORLD EVENTS ({worldEvents.length})
    </h3>
    <div style={s.itemList}>
      {worldEvents.map(ev => (
        <div key={ev.id} style={s.row}>
          <span style={{ ...s.tag, color: ev.source_type === 'manual' ? '#44ff88' : ev.source_type === 'ai' ? '#4fc3f7' : '#888', borderColor: ev.source_type === 'manual' ? '#44ff88' : ev.source_type === 'ai' ? '#4fc3f7' : '#444' }}>
            {ev.source_type?.toUpperCase()}
          </span>
          <span style={s.tag}>{ev.location_name}</span>
          <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#e8e8e0', flex: 1 }}>{ev.headline}</p>
          <button style={{ ...s.secondaryBtn, padding: '0.2rem 0.6rem', fontSize: '0.6rem' }} onClick={() => {
            setEditingEvent(ev)
            setEventForm({
              headline: ev.headline,
              summary: ev.summary || '',
              location_name: ev.location_name,
              x_percent: ev.x_percent,
              y_percent: ev.y_percent,
              realm: ev.y_percent <= 35 ? 'north' : ev.y_percent <= 65 ? 'middle' : 'south',
              source_type: ev.source_type || 'manual',
            })
          }}>EDIT</button>
          <button style={s.deleteBtn} onClick={() => handleDeleteEvent(ev.id)}>DEL</button>
        </div>
      ))}
      {worldEvents.length === 0 && <p style={s.hint}>// No events yet.</p>}
    </div>

    <div style={s.divider} />

    {/* Locations */}
    <h3 style={{ ...s.label, fontSize: '0.8rem', color: '#e8e8e0' }}>WORLD LOCATIONS</h3>
    <p style={s.hint}>x/y are 0–100 percent coordinates. North = low y, South = high y.</p>
    {[['NAME', 'name'], ['DESCRIPTION', 'description'], ['X POSITION (0-100)', 'x_percent'], ['Y POSITION (0-100)', 'y_percent']].map(([lbl, key]) => (
      <div key={key} style={s.field}>
        <label style={s.label}>{lbl}</label>
        <input style={s.input} type={key.includes('percent') ? 'number' : 'text'} value={locForm[key]} onChange={e => setLocForm({ ...locForm, [key]: key.includes('percent') ? Number(e.target.value) : e.target.value })} />
      </div>
    ))}
    <div style={s.field}>
      <label style={s.label}>TYPE</label>
      <select style={s.input} value={locForm.type} onChange={e => setLocForm({ ...locForm, type: e.target.value })}>
        {['city', 'landmark', 'ruin', 'dungeon', 'fortress', 'village'].map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
    <button style={s.primaryBtn} onClick={handleAddLocation}>ADD LOCATION</button>
    <div style={s.itemList}>
      {worldLocations.map(loc => (
        <div key={loc.id} style={s.row}>
          <span style={s.tag}>{loc.type}</span>
          <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#e8e8e0', flex: 1 }}>{loc.name}</p>
          <p style={{ ...s.hint, fontSize: '0.6rem' }}>x:{loc.x_percent} y:{loc.y_percent}</p>
          <button style={s.deleteBtn} onClick={() => handleDeleteLocation(loc.id)}>DEL</button>
        </div>
      ))}
    </div>

  </div>
)}

        </main>
      </div>
    </div>
  )
}
