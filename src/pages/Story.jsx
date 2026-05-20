import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'

function LibraryScene() {
  const candleRef = useRef()
  const flameRef = useRef()

  useFrame((state) => {
    if (candleRef.current) {
      candleRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 3.5) * 0.15 + Math.sin(state.clock.elapsedTime * 7) * 0.05
    }
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.08
      flameRef.current.position.x = Math.sin(state.clock.elapsedTime * 5) * 0.01
    }
  })

  return (
    <group>
      {/* Floor — dark stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#07060a" roughness={0.95} />
      </mesh>

      {/* Ceiling with wooden beams */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050408" roughness={1} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(i - 2) * 3, 5.5, 0]}>
          <boxGeometry args={[0.3, 0.4, 30]} />
          <meshStandardMaterial color="#0d0a10" roughness={1} />
        </mesh>
      ))}

      {/* Walls */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[40, 20, 0.2]} />
        <meshStandardMaterial color="#060508" roughness={1} />
      </mesh>
      <mesh position={[-10, 2, 0]}>
        <boxGeometry args={[0.2, 20, 40]} />
        <meshStandardMaterial color="#060508" roughness={1} />
      </mesh>
      <mesh position={[10, 2, 0]}>
        <boxGeometry args={[0.2, 20, 40]} />
        <meshStandardMaterial color="#060508" roughness={1} />
      </mesh>

      {/* Bookshelves — left wall */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`ls${i}`} position={[-9.6, -0.5, -2 - i * 3.5]}>
          <mesh>
            <boxGeometry args={[0.3, 5, 2.8]} />
            <meshStandardMaterial color="#0d0a0f" roughness={0.9} />
          </mesh>
          {Array.from({ length: 12 }).map((_, j) => (
            <mesh key={j} position={[0.2, (j % 4) * 0.5 - 0.8, (j % 3) * 0.7 - 0.7]}>
              <boxGeometry args={[0.15, 0.42, 0.18]} />
              <meshStandardMaterial color={`hsl(${j * 30}, 10%, ${5 + j % 8}%)`} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Bookshelves — right wall */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`rs${i}`} position={[9.6, -0.5, -2 - i * 3.5]}>
          <mesh>
            <boxGeometry args={[0.3, 5, 2.8]} />
            <meshStandardMaterial color="#0d0a0f" roughness={0.9} />
          </mesh>
          {Array.from({ length: 12 }).map((_, j) => (
            <mesh key={j} position={[-0.2, (j % 4) * 0.5 - 0.8, (j % 3) * 0.7 - 0.7]}>
              <boxGeometry args={[0.15, 0.42, 0.18]} />
              <meshStandardMaterial color={`hsl(${j * 25 + 15}, 8%, ${4 + j % 9}%)`} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Reading table */}
      <group position={[0, -2, -4]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[3, 0.1, 1.5]} />
          <meshStandardMaterial color="#14100c" roughness={0.7} metalness={0.1} />
        </mesh>
        {[[-1.2, 0], [1.2, 0]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[0.1, 1.2, 0.1]} />
            <meshStandardMaterial color="#100d09" roughness={0.9} />
          </mesh>
        ))}
        {/* Open book on table */}
        <mesh position={[0, 0.68, 0]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[1.2, 0.02, 0.9]} />
          <meshStandardMaterial color="#e8e0d0" roughness={1} />
        </mesh>
        {/* Book pages line */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, 0.69, -0.35 + i * 0.1]} rotation={[0, 0.1, 0]}>
            <boxGeometry args={[1.15, 0.001, 0.001]} />
            <meshStandardMaterial color="#c8b89a" />
          </mesh>
        ))}
      </group>

      {/* Candle on table */}
      <group position={[1, -1.2, -4]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#e8e0d0" />
        </mesh>
        <mesh ref={flameRef} position={[0, 0.28, 0]}>
          <coneGeometry args={[0.03, 0.12, 8]} />
          <meshStandardMaterial color="#ffcc44" emissive="#ff8800" emissiveIntensity={2} />
        </mesh>
        <pointLight ref={candleRef} position={[0, 0.4, 0]} intensity={0.8} distance={6} color="#c8780a" decay={2} />
      </group>

      {/* Ambient candles along walls */}
      {[[-7, 1, -3], [7, 1, -6], [-7, 1, -9], [7, 1, -9]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <pointLight intensity={0.3} distance={5} color="#a05a08" decay={2} />
        </group>
      ))}

      <ambientLight intensity={0.008} color="#3a2010" />
    </group>
  )
}

function CameraFloat() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.5
    state.camera.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 0.08) * 0.15
    state.camera.lookAt(0, -0.3, -4)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#07060a', 0.07)
    return () => { scene.fog = null }
  }, [scene])
  return null
}

function TunnelBack({ active, onComplete }) {
  useEffect(() => {
    if (active) { const t = setTimeout(onComplete, 900); return () => clearTimeout(t) }
  }, [active])
  if (!active) return null
  return <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', animation: 'fadeIn 0.9s ease forwards' }} />
}

export default function Story({ onBack }) {
  const [chapters, setChapters] = useState([])
  const [selected, setSelected] = useState(null)
  const [tunneling, setTunneling] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/api/chapters').then(r => {
      setChapters((r.data || []).filter(c => c.published))
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#07060a', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .chapter-card { cursor:pointer; border:1px solid rgba(200,184,154,0.08); padding:1.5rem; transition:all 0.3s; position:relative; overflow:hidden; }
        .chapter-card:hover { border-color:rgba(200,184,154,0.25); background:rgba(200,184,154,0.03); }
        .chapter-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(200,184,154,0.03), transparent); opacity:0; transition:opacity 0.3s; }
        .chapter-card:hover::before { opacity:1; }
        .return-btn { background:transparent; border:1px solid rgba(200,184,154,0.2); color:#c8b89a; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.6rem 1.2rem; cursor:pointer; transition:all 0.3s; }
        .return-btn:hover { border-color:rgba(200,184,154,0.5); }
        .close-btn { background:transparent; border:1px solid rgba(200,184,154,0.2); color:#c8b89a; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.5rem 1rem; cursor:pointer; }
        ::-webkit-scrollbar { width:2px; } ::-webkit-scrollbar-track { background:#07060a; } ::-webkit-scrollbar-thumb { background:#2a1f10; }
      `}</style>

      <Canvas camera={{ position: [0, 0.3, 6], fov: 65 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <LibraryScene />
        </Suspense>
      </Canvas>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(7,6,10,0.2) 0%, rgba(7,6,10,0.88) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', background: 'linear-gradient(to bottom, rgba(7,6,10,0.95), transparent)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'all', animation: 'fadeInUp 0.8s ease forwards' }}>
          <button className="return-btn" onClick={() => setTunneling(true)}>← STATION</button>
        </div>
        <div>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.2)', letterSpacing: '0.4em' }}>// PLATFORM 05 — STORY</p>
        </div>
      </div>

      {/* Chapter list */}
      {!selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 3rem 3rem' }}>
          <div style={{ width: '100%', maxWidth: '680px', animation: 'fadeIn 0.8s ease forwards', animationDelay: '0.3s', opacity: 0 }}>
            <div style={{ marginBottom: '3rem' }}>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.25)', letterSpacing: '0.5em', marginBottom: '0.75rem' }}>// THE LAND OF THREE</p>
              <h1 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: 'clamp(2rem,4vw,3rem)', color: '#e8e0d0', fontWeight: 300, letterSpacing: '0.05em' }}>Chronicles</h1>
            </div>

            {loaded && chapters.length === 0 && (
              <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.65rem', color: 'rgba(200,184,154,0.12)', letterSpacing: '0.3em' }}>// THE ARCHIVE IS EMPTY. THE STORY HAS NOT YET BEGUN.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {chapters.map((ch, i) => (
                <div key={ch.id} className="chapter-card" onClick={() => setSelected(ch)}
                  style={{ animation: 'fadeInUp 0.6s ease forwards', animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                  {ch.cover_url && (
                    <div style={{ width: '100%', height: '120px', marginBottom: '1rem', overflow: 'hidden' }}>
                      <img src={ch.cover_url} alt={ch.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%) brightness(0.7)' }} />
                    </div>
                  )}
                  <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.3)', letterSpacing: '0.4em', marginBottom: '0.5rem' }}>
                    CHAPTER {String(ch.chapter_order).padStart(2, '0')}
                  </p>
                  <h2 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '1.2rem', color: '#e8e0d0', fontWeight: 300, marginBottom: '0.3rem' }}>{ch.title}</h2>
                  {ch.subtitle && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.65rem', color: 'rgba(200,184,154,0.35)', letterSpacing: '0.1em' }}>{ch.subtitle}</p>}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.75rem', color: 'rgba(200,184,154,0.07)', letterSpacing: '0.3em' }}>図書館</p>
            </div>
          </div>
        </div>
      )}

      {/* Chapter reader */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(7,6,10,0.97)', overflowY: 'auto', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 3rem' }}>
            <button className="close-btn" onClick={() => setSelected(null)} style={{ marginBottom: '3rem' }}>← BACK TO CHAPTERS</button>

            <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.25)', letterSpacing: '0.5em', marginBottom: '0.75rem' }}>
              CHAPTER {String(selected.chapter_order).padStart(2, '0')}
            </p>
            <h1 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: 'clamp(1.8rem,3vw,2.5rem)', color: '#e8e0d0', fontWeight: 300, marginBottom: '0.5rem' }}>{selected.title}</h1>
            {selected.subtitle && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.7rem', color: 'rgba(200,184,154,0.35)', letterSpacing: '0.15em', marginBottom: '2.5rem' }}>{selected.subtitle}</p>}

            {selected.cover_url && (
              <div style={{ width: '100%', height: '280px', marginBottom: '2.5rem', overflow: 'hidden' }}>
                <img src={selected.cover_url} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) brightness(0.8)' }} />
              </div>
            )}

            <div style={{ width: '40px', height: '1px', background: 'rgba(200,184,154,0.2)', margin: '2rem 0' }} />

            <div style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '1rem', color: 'rgba(232,224,208,0.7)', lineHeight: 2.1, fontWeight: 300, whiteSpace: 'pre-wrap' }}>
              {selected.content || '// This chapter has no content yet.'}
            </div>
          </div>
        </div>
      )}

      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
