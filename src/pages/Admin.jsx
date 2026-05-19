import { useState, useEffect } from 'react'
import api, { setAuthToken } from '../utils/api'

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [tab, setTab] = useState('bio')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const [bio, setBio] = useState({
    name: 'Swift Caulfield',
    role: 'Artist / Illustrator',
    bio_text: '',
    tags: 'Illustration, Concept Art, Graphic Design, Digital Art',
    pfp_url: ''
  })
  const [artItems, setArtItems] = useState([])
  const [videoItems, setVideoItems] = useState([])
  const [designItems, setDesignItems] = useState([])
  const [videoForm, setVideoForm] = useState({ title: '', url: '' })

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('portfolio_token')
    if (token) {
      setAuthToken(token)
      setUnlocked(true)
      fetchAll()
    }
  }, [])

  const fetchAll = async () => {
    try {
      const [bioRes, artRes, videoRes, designRes] = await Promise.all([
        api.get('/api/bio'),
        api.get('/api/art'),
        api.get('/api/videos'),
        api.get('/api/design'),
      ])
      if (bioRes.data) setBio(bioRes.data)
      setArtItems(artRes.data)
      setVideoItems(videoRes.data)
      setDesignItems(designRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogin = async () => {
    try {
      const res = await api.post('/api/auth/login', { password: passwordInput })
      setAuthToken(res.data.token)
      setUnlocked(true)
      fetchAll()
    } catch {
      setPasswordError(true)
    }
  }

  const showSuccess = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleBioSave = async () => {
    setSaving(true)
    try {
      await api.put('/api/bio', bio)
      showSuccess('Bio saved!')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handlePfpUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await api.post('/api/bio/pfp', { image: reader.result })
        setBio(prev => ({ ...prev, pfp_url: res.data.url }))
        showSuccess('PFP uploaded!')
      } catch (err) {
        console.error(err)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddArt = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await api.post('/api/art', {
          image: reader.result,
          title: file.name
        })
        setArtItems(prev => [res.data, ...prev])
        showSuccess('Art uploaded!')
      } catch (err) {
        console.error(err)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddDesign = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await api.post('/api/design', {
          image: reader.result,
          title: file.name
        })
        setDesignItems(prev => [res.data, ...prev])
        showSuccess('Design uploaded!')
      } catch (err) {
        console.error(err)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddVideo = async () => {
    if (!videoForm.title || !videoForm.url) return
    try {
      const res = await api.post('/api/videos', {
        title: videoForm.title,
        youtube_url: videoForm.url
      })
      setVideoItems(prev => [res.data, ...prev])
      setVideoForm({ title: '', url: '' })
      showSuccess('Video added!')
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (type, id) => {
    try {
      await api.delete(`/api/${type}/${id}`)
      if (type === 'art') setArtItems(prev => prev.filter(i => i.id !== id))
      if (type === 'videos') setVideoItems(prev => prev.filter(i => i.id !== id))
      if (type === 'design') setDesignItems(prev => prev.filter(i => i.id !== id))
      showSuccess('Deleted!')
    } catch (err) {
      console.error(err)
    }
  }

  if (!unlocked) return (
    <div style={styles.lockScreen}>
      <div style={styles.lockCard}>
        <p style={styles.lockLabel}>// RESTRICTED ACCESS</p>
        <h2 style={styles.lockTitle}>ADMIN PANEL</h2>
        <p style={styles.lockSub}>Enter access code to continue</p>
        <input
          style={styles.input}
          type='password'
          value={passwordInput}
          onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder='Enter password'
          autoFocus
        />
        {passwordError && <p style={styles.lockError}>// ACCESS DENIED</p>}
        <button style={styles.primaryBtn} onClick={handleLogin}>
          UNLOCK
        </button>
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.grid} />

      <header style={styles.header}>
        <h1 style={styles.logo}>// ADMIN PANEL</h1>
        <div style={styles.headerRight}>
          {success && <p style={styles.success}>{success}</p>}
          <button
            style={styles.logoutBtn}
            onClick={() => { setAuthToken(null); setUnlocked(false) }}
          >
            LOGOUT
          </button>
          <a href='/' style={styles.backBtn}>← BACK TO SITE</a>
        </div>
      </header>

      <div style={styles.body}>
        <nav style={styles.sidebar}>
          {['bio', 'art', 'videos', 'design'].map(t => (
            <button
              key={t}
              style={{
                ...styles.sideBtn,
                borderColor: tab === t ? '#4fc3f7' : '#1a1a2e',
                color: tab === t ? '#4fc3f7' : '#888880',
              }}
              onClick={() => setTab(t)}
            >
              {t === 'bio' && '01 — BIO'}
              {t === 'art' && '02 — ART'}
              {t === 'videos' && '03 — VIDEO'}
              {t === 'design' && '04 — DESIGN'}
            </button>
          ))}
        </nav>

        <main style={styles.main}>

          {tab === 'bio' && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>EDIT BIO</h2>
              <div style={styles.field}>
                <label style={styles.label}>PROFILE PICTURE</label>
                {bio.pfp_url && <img src={bio.pfp_url} alt='pfp' style={styles.pfpPreview} />}
                <input type='file' accept='image/*' onChange={handlePfpUpload} style={styles.fileInput} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>NAME</label>
                <input style={styles.input} value={bio.name || ''} onChange={e => setBio({ ...bio, name: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>ROLE</label>
                <input style={styles.input} value={bio.role || ''} onChange={e => setBio({ ...bio, role: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>BIO TEXT</label>
                <textarea
                  style={{ ...styles.input, ...styles.textarea }}
                  value={bio.bio_text || ''}
                  onChange={e => setBio({ ...bio, bio_text: e.target.value })}
                  placeholder='Write something about yourself...'
                  rows={6}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>TAGS (comma separated)</label>
                <input style={styles.input} value={bio.tags || ''} onChange={e => setBio({ ...bio, tags: e.target.value })} />
              </div>
              <button style={{ ...styles.primaryBtn, opacity: saving ? 0.6 : 1 }} onClick={handleBioSave} disabled={saving}>
                {saving ? 'SAVING...' : 'SAVE BIO'}
              </button>
            </div>
          )}

          {tab === 'art' && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>MANAGE ART</h2>
              <div style={styles.field}>
                <label style={styles.label}>UPLOAD ART PIECE</label>
                <input type='file' accept='image/*' onChange={handleAddArt} style={styles.fileInput} />
              </div>
              <div style={styles.itemGrid}>
                {artItems.map(item => (
                  <div key={item.id} style={styles.itemCard}>
                    <img src={item.image_url} alt={item.title} style={styles.itemImg} />
                    <div style={styles.itemFooter}>
                      <p style={styles.itemTitle}>{item.title}</p>
                      <button style={styles.deleteBtn} onClick={() => handleDelete('art', item.id)}>DEL</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'videos' && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>MANAGE VIDEOS</h2>
              <div style={styles.field}>
                <label style={styles.label}>VIDEO TITLE</label>
                <input style={styles.input} value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} placeholder='My Artwork Process' />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>YOUTUBE URL</label>
                <input style={styles.input} value={videoForm.url} onChange={e => setVideoForm({ ...videoForm, url: e.target.value })} placeholder='https://youtube.com/watch?v=...' />
              </div>
              <button style={styles.primaryBtn} onClick={handleAddVideo}>ADD VIDEO</button>
              <div style={styles.itemList}>
                {videoItems.map(item => (
                  <div key={item.id} style={styles.videoRow}>
                    <p style={styles.itemTitle}>{item.title}</p>
                    <p style={styles.videoUrl}>{item.youtube_url}</p>
                    <button style={styles.deleteBtn} onClick={() => handleDelete('videos', item.id)}>DEL</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'design' && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>MANAGE DESIGNS</h2>
              <div style={styles.field}>
                <label style={styles.label}>UPLOAD DESIGN</label>
                <input type='file' accept='image/*' onChange={handleAddDesign} style={styles.fileInput} />
              </div>
              <div style={styles.itemGrid}>
                {designItems.map(item => (
                  <div key={item.id} style={styles.itemCard}>
                    <img src={item.image_url} alt={item.title} style={styles.itemImg} />
                    <div style={styles.itemFooter}>
                      <p style={styles.itemTitle}>{item.title}</p>
                      <button style={styles.deleteBtn} onClick={() => handleDelete('design', item.id)}>DEL</button>
                    </div>
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

const styles = {
  lockScreen: { minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lockCard: { background: '#0a0a12', border: '1px solid #1a1a2e', padding: '3rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  lockLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#4fc3f7', letterSpacing: '0.2em' },
  lockTitle: { fontFamily: 'var(--font-title)', fontSize: '2rem', color: '#e8e8e0', letterSpacing: '0.1em' },
  lockSub: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#888880', marginBottom: '0.5rem' },
  lockError: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#c62828', letterSpacing: '0.1em' },
  container: { minHeight: '100vh', background: '#000', position: 'relative' },
  grid: { position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(79,195,247,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.02) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #0d1117' },
  logo: { fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#4fc3f7', letterSpacing: '0.2em' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  success: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#44ff88', letterSpacing: '0.1em' },
  logoutBtn: { background: 'transparent', border: '1px solid #333', color: '#888880', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', padding: '0.4rem 1rem', cursor: 'pointer' },
  backBtn: { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#888880', letterSpacing: '0.15em', textDecoration: 'none' },
  body: { display: 'flex', minHeight: 'calc(100vh - 73px)' },
  sidebar: { width: '200px', borderRight: '1px solid #0d1117', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  sideBtn: { background: 'transparent', border: '1px solid', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.15em', padding: '0.75rem 1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  main: { flex: 1, padding: '3rem' },
  section: { maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  sectionTitle: { fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: '#e8e8e0', letterSpacing: '0.1em', marginBottom: '0.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888880', letterSpacing: '0.2em' },
  input: { background: '#0a0a12', border: '1px solid #1a1a2e', color: '#e8e8e0', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', padding: '0.75rem 1rem', outline: 'none', width: '100%' },
  textarea: { resize: 'vertical', lineHeight: 1.7 },
  fileInput: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#888880', cursor: 'pointer' },
  pfpPreview: { width: '120px', height: '120px', objectFit: 'cover', border: '1px solid #1a1a2e', marginBottom: '0.5rem' },
  primaryBtn: { background: '#4fc3f7', border: 'none', color: '#000', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.2em', padding: '0.9rem 2rem', cursor: 'pointer', alignSelf: 'flex-start' },
  itemGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' },
  itemCard: { background: '#0a0a12', border: '1px solid #1a1a2e' },
  itemImg: { width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' },
  itemFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem' },
  itemTitle: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' },
  deleteBtn: { background: 'transparent', border: '1px solid #c62828', color: '#c62828', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.2rem 0.5rem', cursor: 'pointer' },
  itemList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' },
  videoRow: { background: '#0a0a12', border: '1px solid #1a1a2e', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  videoUrl: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#4fc3f7', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
}