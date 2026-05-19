import { useState } from 'react'

export default function Portfolio() {
  const [active, setActive] = useState('about')

  return (
    <div style={styles.container}>
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Side nav — train platforms */}
      <nav style={styles.nav}>
        <p style={styles.navLabel}>// PLATFORMS</p>
        {['about', 'art', 'video', 'design'].map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.navBtn,
              borderColor: active === tab ? '#4fc3f7' : '#1a1a2e',
              color: active === tab ? '#4fc3f7' : '#888880',
            }}
            onClick={() => setActive(tab)}
          >
            {tab === 'about' && '01 — ABOUT'}
            {tab === 'art' && '02 — ART'}
            {tab === 'video' && '03 — VIDEO'}
            {tab === 'design' && '04 — DESIGN'}
          </button>
        ))}
        <div style={styles.navDivider} />
        <p style={styles.navCredit}>// SWIFT CAULFIELD</p>
      </nav>

      {/* Main content */}
      <main style={styles.main}>
        {active === 'about' && <AboutSection />}
        {active === 'art' && <ArtSection />}
        {active === 'video' && <VideoSection />}
        {active === 'design' && <DesignSection />}
      </main>
    </div>
  )
}

function AboutSection() {
  return (
    <div style={styles.section} className='fade-in'>
      <p style={styles.sectionLabel}>// PLATFORM 01</p>
      <h2 style={styles.sectionTitle}>ABOUT</h2>
      <div style={styles.aboutGrid}>
        {/* Avatar placeholder */}
        <div style={styles.avatarWrap}>
          <div style={styles.avatarPlaceholder}>
            <p style={styles.avatarText}>PFP</p>
          </div>
          <div style={styles.avatarGlow} />
        </div>
        {/* Bio */}
        <div style={styles.bio}>
          <h3 style={styles.bioName}>Swift Caulfield</h3>
          <p style={styles.bioRole}>// Artist / Illustrator</p>
          <div style={styles.bioLine} />
          <p style={styles.bioText}>
            Your bio goes here. Tell the world who you are, 
            what you create, and what drives your art. 
            Keep it dark, keep it honest.
          </p>
          <div style={styles.bioTags}>
            {['Illustration', 'Concept Art', 'Graphic Design', 'Digital Art'].map(tag => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ArtSection() {
  return (
    <div style={styles.section} className='fade-in'>
      <p style={styles.sectionLabel}>// PLATFORM 02</p>
      <h2 style={styles.sectionTitle}>ART GALLERY</h2>
      <div style={styles.galleryGrid}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={styles.galleryItem}>
            <div style={styles.galleryPlaceholder}>
              <p style={styles.galleryText}>// ART {i}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoSection() {
  return (
    <div style={styles.section} className='fade-in'>
      <p style={styles.sectionLabel}>// PLATFORM 03</p>
      <h2 style={styles.sectionTitle}>VIDEO</h2>
      <div style={styles.videoGrid}>
        {[1,2,3].map(i => (
          <div key={i} style={styles.videoItem}>
            <div style={styles.videoPlaceholder}>
              <p style={styles.galleryText}>// VIDEO {i}</p>
            </div>
            <p style={styles.videoTitle}>Video Title {i}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesignSection() {
  return (
    <div style={styles.section} className='fade-in'>
      <p style={styles.sectionLabel}>// PLATFORM 04</p>
      <h2 style={styles.sectionTitle}>GRAPHIC DESIGN</h2>
      <div style={styles.galleryGrid}>
        {[1,2,3,4].map(i => (
          <div key={i} style={styles.galleryItem}>
            <div style={styles.galleryPlaceholder}>
              <p style={styles.galleryText}>// DESIGN {i}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    position: 'relative',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(79,195,247,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79,195,247,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  nav: {
    width: '220px',
    minHeight: '100vh',
    borderRight: '1px solid #0d1117',
    padding: '3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'sticky',
    top: 0,
    background: '#000',
    zIndex: 10,
  },
  navLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: '#333',
    letterSpacing: '0.2em',
    marginBottom: '1rem',
  },
  navBtn: {
    background: 'transparent',
    border: '1px solid',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    letterSpacing: '0.15em',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  navDivider: {
    height: '1px',
    background: '#0d1117',
    margin: '1rem 0',
    marginTop: 'auto',
  },
  navCredit: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: '#222',
    letterSpacing: '0.15em',
  },
  main: {
    flex: 1,
    padding: '4rem 3rem',
    overflowY: 'auto',
  },
  section: {
    maxWidth: '900px',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: '#4fc3f7',
    letterSpacing: '0.3em',
    opacity: 0.6,
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    color: '#e8e8e0',
    letterSpacing: '0.1em',
    marginBottom: '3rem',
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '3rem',
    alignItems: 'start',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '250px',
    height: '320px',
    background: '#0a0a12',
    border: '1px solid #1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: '#333',
  },
  avatarGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(79,195,247,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bio: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  bioName: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    color: '#e8e8e0',
    letterSpacing: '0.1em',
  },
  bioRole: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: '#4fc3f7',
    letterSpacing: '0.2em',
  },
  bioLine: {
    width: '60px',
    height: '1px',
    background: '#4fc3f7',
    opacity: 0.4,
  },
  bioText: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: '#888880',
    lineHeight: 1.8,
  },
  bioTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: '#4fc3f7',
    border: '1px solid #1a3a4a',
    padding: '0.3rem 0.75rem',
    letterSpacing: '0.1em',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  galleryItem: {
    cursor: 'pointer',
  },
  galleryPlaceholder: {
    aspectRatio: '1',
    background: '#0a0a12',
    border: '1px solid #1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.2s',
  },
  galleryText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: '#333',
  },
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  videoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  videoPlaceholder: {
    aspectRatio: '16/9',
    background: '#0a0a12',
    border: '1px solid #1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: '#888880',
    letterSpacing: '0.1em',
  },
}