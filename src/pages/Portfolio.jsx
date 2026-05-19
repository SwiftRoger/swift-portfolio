import { useState, useEffect, useRef } from 'react'
import api, { setAuthToken } from '../utils/api'

const MOODS = {
  bio: {
    bg: '#0a0806',
    accent: '#c8b89a',
    grain: true,
    font: '"Noto Serif JP", serif',
    label: '// PLATFORM 01',
    atmosphere: 'waiting-room',
  },
  art: {
    bg: '#000000',
    accent: '#ffffff',
    grain: false,
    font: '"Space Mono", monospace',
    label: '// PLATFORM 02',
    atmosphere: 'gallery',
  },
  videos: {
    bg: '#06060a',
    accent: '#e0d5c0',
    grain: true,
    font: '"Space Mono", monospace',
    label: '// PLATFORM 03',
    atmosphere: 'projection',
  },
  design: {
    bg: '#050505',
    accent: '#e8e8e0',
    grain: false,
    font: '"Space Mono", monospace',
    label: '// PLATFORM 04',
    atmosphere: 'brutalist',
  },
}

function TunnelTransition({ active, onComplete }) {
  const ref = useRef()
  useEffect(() => {
    if (active) {
      const t = setTimeout(onComplete, 900)
      return () => clearTimeout(t)
    }
  }, [active])

  if (!active) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'tunnelIn 0.9s cubic-bezier(0.7,0,1,1) forwards',
    }}>
      <div style={{
        width: '4px', height: '4px',
        background: '#fff',
        borderRadius: '50%',
        animation: 'tunnelDot 0.9s ease forwards',
      }} />
    </div>
  )
}

function GrainOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
      opacity: 0.045,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />
  )
}

function BioSection({ data, mood }) {
  const [typed, setTyped] = useState('')
  const fullText = data?.bio_text || 'Artist. Illustrator. Creator of dark, intricate worlds.'

  useEffect(() => {
    setTyped('')
    let i = 0
    const t = setInterval(() => {
      setTyped(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(t)
    }, 28)
    return () => clearInterval(t)
  }, [fullText])

  const tags = (data?.tags || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 3rem', animation: 'sectionIn 0.8s ease forwards' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '5rem', alignItems: 'start' }}>

        {/* Left — PFP */}
        <div>
          <div style={{
            width: '100%',
            aspectRatio: '3/4',
            background: '#111',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(200,184,154,0.1)',
          }}>
            {data?.pfp_url
              ? <img src={data.pfp_url} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%) contrast(1.1)' }} />
              : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.65rem', color: 'rgba(200,184,154,0.2)', letterSpacing: '0.3em' }}>// NO IMAGE</p>
                </div>
              )
            }
            {/* Atmospheric overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,8,6,0.6) 0%, transparent 50%)' }} />
          </div>

          {/* Tags */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map(tag => (
              <span key={tag} style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.6rem',
                color: 'rgba(200,184,154,0.5)',
                border: '1px solid rgba(200,184,154,0.15)',
                padding: '0.3rem 0.6rem',
                letterSpacing: '0.15em',
              }}>{tag.toUpperCase()}</span>
            ))}
          </div>
        </div>

        {/* Right — Text */}
        <div style={{ paddingTop: '2rem' }}>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.6rem',
            color: 'rgba(200,184,154,0.3)',
            letterSpacing: '0.4em',
            marginBottom: '1rem',
          }}>// IDENTITY</p>

          <h1 style={{
            fontFamily: '"Noto Serif JP", serif',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: '#e8e0d0',
            fontWeight: 300,
            lineHeight: 1.15,
            marginBottom: '0.5rem',
          }}>{data?.name || 'Swift Caulfield'}</h1>

          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.75rem',
            color: 'rgba(200,184,154,0.5)',
            letterSpacing: '0.2em',
            marginBottom: '3rem',
          }}>{data?.role || 'Artist / Illustrator'}</p>

          <div style={{
            width: '40px',
            height: '1px',
            background: 'rgba(200,184,154,0.3)',
            marginBottom: '2rem',
          }} />

          <p style={{
            fontFamily: '"Noto Serif JP", serif',
            fontSize: '1.05rem',
            color: 'rgba(232,224,208,0.7)',
            lineHeight: 1.9,
            fontWeight: 300,
            minHeight: '3em',
          }}>
            {typed}
            <span style={{ animation: 'blink 1s step-end infinite', color: 'rgba(200,184,154,0.6)' }}>_</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function ArtSection({ items }) {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ padding: '4rem 3rem', animation: 'sectionIn 0.8s ease forwards' }}>
      <div style={{
        columns: '3',
        columnGap: '2px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem', fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.3em' }}>
            // NO ART UPLOADED YET
          </div>
        )}
        {items.map((item, i) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            style={{
              breakInside: 'avoid',
              marginBottom: '2px',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              animation: `sectionIn 0.6s ease forwards`,
              animationDelay: `${i * 0.05}s`,
              opacity: 0,
            }}
          >
            <img
              src={item.image_url}
              alt={item.title}
              style={{
                width: '100%',
                display: 'block',
                filter: 'grayscale(20%) contrast(1.05)',
                transition: 'filter 0.4s, transform 0.6s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%) contrast(1.1)'; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(20%) contrast(1.05)'; e.currentTarget.style.transform = 'scale(1)' }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <img
            src={selected.image_url}
            alt={selected.title}
            style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain' }}
          />
          <p style={{
            position: 'absolute', bottom: '2rem',
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.3em',
          }}>{selected.title.toUpperCase()} — CLICK TO CLOSE</p>
        </div>
      )}
    </div>
  )
}

function VideoSection({ items }) {
  const getEmbedUrl = (url) => {
    try {
      const u = new URL(url)
      const id = u.searchParams.get('v') || u.pathname.split('/').pop()
      return `https://www.youtube.com/embed/${id}`
    } catch { return url }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 3rem', animation: 'sectionIn 0.8s ease forwards' }}>
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '6rem', fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', color: 'rgba(224,213,192,0.15)', letterSpacing: '0.3em' }}>
          // NO VIDEOS YET
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {items.map((item, i) => (
          <div key={item.id} style={{
            animation: 'sectionIn 0.6s ease forwards',
            animationDelay: `${i * 0.1}s`,
            opacity: 0,
          }}>
            <p style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.6rem',
              color: 'rgba(224,213,192,0.25)',
              letterSpacing: '0.4em',
              marginBottom: '0.75rem',
            }}>// {String(i + 1).padStart(2, '0')}</p>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              background: '#0a0a0e',
              overflow: 'hidden',
              border: '1px solid rgba(224,213,192,0.06)',
            }}>
              <iframe
                src={getEmbedUrl(item.youtube_url)}
                title={item.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
            <p style={{
              fontFamily: '"Noto Serif JP", serif',
              fontSize: '1rem',
              color: 'rgba(224,213,192,0.6)',
              marginTop: '0.75rem',
              fontWeight: 300,
              letterSpacing: '0.05em',
            }}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DesignSection({ items }) {
  return (
    <div style={{ padding: '4rem 3rem', animation: 'sectionIn 0.8s ease forwards' }}>
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '6rem', fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', color: 'rgba(232,232,224,0.15)', letterSpacing: '0.3em' }}>
          // NO DESIGNS YET
        </div>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'rgba(232,232,224,0.05)',
      }}>
        {items.map((item, i) => (
          <div key={item.id} style={{
            background: '#050505',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            animation: 'sectionIn 0.6s ease forwards',
            animationDelay: `${i * 0.06}s`,
            opacity: 0,
          }}>
            <img
              src={item.image_url}
              alt={item.title}
              style={{
                width: '100%',
                aspectRatio: '1',
                objectFit: 'cover',
                display: 'block',
                filter: 'grayscale(15%)',
                transition: 'transform 0.5s, filter 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.filter = 'grayscale(0%)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'grayscale(15%)' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '1rem',
              background: 'linear-gradient(to top, rgba(5,5,5,0.9), transparent)',
              opacity: 0,
              transition: 'opacity 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.65rem', color: 'rgba(232,232,224,0.7)', letterSpacing: '0.2em' }}>
                {item.title.toUpperCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Portfolio({ initialSection = 'bio', onBack }) {
  const [activeTab, setActiveTab] = useState(initialSection)
  const [bio, setBio] = useState(null)
  const [artItems, setArtItems] = useState([])
  const [videoItems, setVideoItems] = useState([])
  const [designItems, setDesignItems] = useState([])
  const [tunneling, setTunneling] = useState(false)
  const [switching, setSwitching] = useState(false)

  const mood = MOODS[activeTab] || MOODS.bio

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bioRes, artRes, videoRes, designRes] = await Promise.all([
          api.get('/api/bio'),
          api.get('/api/art'),
          api.get('/api/videos'),
          api.get('/api/design'),
        ])
        if (bioRes.data) setBio(bioRes.data)
        setArtItems(artRes.data || [])
        setVideoItems(videoRes.data || [])
        setDesignItems(designRes.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchAll()
  }, [])

  const handleBack = () => {
    setTunneling(true)
  }

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return
    setSwitching(true)
    setTimeout(() => {
      setActiveTab(tab)
      setSwitching(false)
    }, 300)
  }

  const TABS = [
    { id: 'bio', label: '01 — BIO' },
    { id: 'art', label: '02 — ART' },
    { id: 'videos', label: '03 — VIDEO' },
    { id: 'design', label: '04 — DESIGN' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: mood.bg,
      color: mood.accent,
      transition: 'background 0.6s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes sectionIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes tunnelIn {
          0% { transform: scale(1); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: scale(0.02); opacity: 1; }
        }
        @keyframes tunnelDot {
          0% { transform: scale(1); opacity: 0; }
          50% { transform: scale(40); opacity: 1; }
          100% { transform: scale(200); opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .tab-btn {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          border-left: 1px solid transparent;
          color: inherit;
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          padding: 0.9rem 1.5rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0.35;
        }
        .tab-btn:hover { opacity: 0.7; padding-left: 2rem; }
        .tab-btn.active { opacity: 1; border-left-color: currentColor; padding-left: 2rem; }

        .back-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: inherit;
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          padding: 0.6rem 1.2rem;
          cursor: pointer;
          transition: all 0.3s;
          opacity: 0.5;
        }
        .back-btn:hover { opacity: 1; border-color: currentColor; }
      `}</style>

      {mood.grain && <GrainOverlay />}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: '200px',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem 0',
        zIndex: 50,
        background: mood.bg,
      }}>
        <div>
          <div style={{ padding: '0 1.5rem', marginBottom: '3rem' }}>
            <p style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.55rem',
              letterSpacing: '0.4em',
              opacity: 0.3,
              marginBottom: '0.3rem',
            }}>// PLATFORMS</p>
          </div>

          <nav>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabSwitch(tab.id)}
                style={{ color: mood.accent }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ padding: '0 1.5rem' }}>
          <button className="back-btn" onClick={handleBack} style={{ color: mood.accent }}>
            ← RETURN
          </button>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.5rem',
            letterSpacing: '0.3em',
            opacity: 0.2,
            marginTop: '1.5rem',
          }}>// SWIFT CAULFIELD</p>
        </div>
      </div>

      {/* Platform label */}
      <div style={{
        position: 'fixed',
        top: '3rem',
        right: '3rem',
        zIndex: 50,
        animation: 'slideIn 0.5s ease forwards',
      }}>
        <p style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.6rem',
          color: mood.accent,
          opacity: 0.2,
          letterSpacing: '0.4em',
        }}>{mood.label}</p>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: '200px',
        minHeight: '100vh',
        opacity: switching ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}>
        {activeTab === 'bio' && <BioSection data={bio} mood={mood} />}
        {activeTab === 'art' && <ArtSection items={artItems} />}
        {activeTab === 'videos' && <VideoSection items={videoItems} />}
        {activeTab === 'design' && <DesignSection items={designItems} />}
      </div>

      {/* Tunnel back transition */}
      <TunnelTransition active={tunneling} onComplete={onBack} />
    </div>
  )
}
