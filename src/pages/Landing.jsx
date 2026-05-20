import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ── 3D SCENE ─────────────────────────────────────────────────────────────────

function StationScene() {
  const lanternRefs = useRef([])

  useFrame((state) => {
    lanternRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.intensity =
          0.5 + Math.sin(state.clock.elapsedTime * (2.5 + i * 0.4)) * 0.12 +
          Math.sin(state.clock.elapsedTime * (6 + i * 0.7)) * 0.04
      }
    })
  })

  return (
    <group>
      {/* Stone floor with subtle tile grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#06050a" roughness={0.95} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) =>
        Array.from({ length: 12 }).map((_, j) => (
          <mesh key={`${i}${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 6) * 3, -2.49, (j - 6) * 3]}>
            <planeGeometry args={[2.95, 2.95]} />
            <meshStandardMaterial color={`hsl(260, 8%, ${2.5 + ((i + j) % 2) * 0.8}%)`} roughness={0.92} />
          </mesh>
        ))
      )}

      {/* Vaulted ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#040309" roughness={1} />
      </mesh>

      {/* Stone arch ribs along ceiling */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`rib${i}`} position={[0, 7.2, -8 + i * 4]}>
          <boxGeometry args={[26, 0.25, 0.18]} />
          <meshStandardMaterial color="#0d0b14" roughness={1} />
        </mesh>
      ))}

      {/* Side walls */}
      <mesh position={[-12, 3, 0]}>
        <boxGeometry args={[0.2, 14, 60]} />
        <meshStandardMaterial color="#070610" roughness={1} />
      </mesh>
      <mesh position={[12, 3, 0]}>
        <boxGeometry args={[0.2, 14, 60]} />
        <meshStandardMaterial color="#070610" roughness={1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -16]}>
        <boxGeometry args={[24, 14, 0.2]} />
        <meshStandardMaterial color="#060510" roughness={1} />
      </mesh>

      {/* Platform edge strip — left */}
      <mesh position={[-5, -2.42, 0]}>
        <boxGeometry args={[0.12, 0.08, 50]} />
        <meshStandardMaterial color="#1a1530" emissive="#100a20" emissiveIntensity={0.4} />
      </mesh>
      {/* Platform edge strip — right */}
      <mesh position={[5, -2.42, 0]}>
        <boxGeometry args={[0.12, 0.08, 50]} />
        <meshStandardMaterial color="#1a1530" emissive="#100a20" emissiveIntensity={0.4} />
      </mesh>

      {/* Wall-mounted lanterns — left */}
      {[-10, -4, 2, 8].map(([z], i) =>
        [[-11.5, 1.5, -10 + i * 5]].map(([x, y, zz], j) => (
          <group key={`ll${i}`} position={[x, y, zz]}>
            <mesh>
              <boxGeometry args={[0.5, 0.7, 0.5]} />
              <meshStandardMaterial color="#0c0a14" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.32, 0.5, 0.32]} />
              <meshStandardMaterial color="#e8c870" emissive="#c08020" emissiveIntensity={0.35} transparent opacity={0.5} />
            </mesh>
            <pointLight
              ref={el => (lanternRefs.current[i] = el)}
              position={[0.6, 0, 0]}
              intensity={0.5}
              distance={7}
              color="#c07818"
              decay={2}
            />
          </group>
        ))
      )}

      {/* Wall-mounted lanterns — right */}
      {[0, 1, 2, 3].map((i) => (
        <group key={`rl${i}`} position={[11.5, 1.5, -10 + i * 5]}>
          <mesh>
            <boxGeometry args={[0.5, 0.7, 0.5]} />
            <meshStandardMaterial color="#0c0a14" roughness={0.5} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.32, 0.5, 0.32]} />
            <meshStandardMaterial color="#e8c870" emissive="#c08020" emissiveIntensity={0.35} transparent opacity={0.5} />
          </mesh>
          <pointLight
            ref={el => (lanternRefs.current[4 + i] = el)}
            position={[-0.6, 0, 0]}
            intensity={0.5}
            distance={7}
            color="#c07818"
            decay={2}
          />
        </group>
      ))}

      {/* Floating ash particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <AshParticle key={i} index={i} />
      ))}

      {/* Overhead dim lights */}
      {[-6, 0, 6].map((z, i) => (
        <pointLight key={i} position={[0, 6, z]} intensity={0.1} distance={12} color="#9070ff" decay={2} />
      ))}

      <ambientLight intensity={0.009} color="#2a1a40" />
    </group>
  )
}

function AshParticle({ index }) {
  const ref = useRef()
  const seed = index * 137.508
  const x0 = ((seed % 20) - 10)
  const z0 = ((seed * 1.3) % 24) - 12
  const speed = 0.04 + (index % 7) * 0.008
  const drift = (index % 3) * 0.015

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = (((-t * speed + index * 0.7) % 6) + 6) % 6 - 2.5
    ref.current.position.x = x0 + Math.sin(t * drift + index) * 0.4
    ref.current.position.z = z0
    ref.current.material.opacity = 0.06 + Math.sin(t * 0.5 + index) * 0.03
  })

  return (
    <mesh ref={ref} position={[x0, 3, z0]}>
      <sphereGeometry args={[0.018, 4, 4]} />
      <meshBasicMaterial color="#c0b0e0" transparent opacity={0.06} />
    </mesh>
  )
}

function CameraFloat() {
  useFrame((state) => {
    const t = state.clock.elapsedTime
    state.camera.position.x = Math.sin(t * 0.07) * 0.4
    state.camera.position.y = 0.5 + Math.sin(t * 0.05) * 0.15
    state.camera.lookAt(0, -0.5, -6)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#06050a', 0.045)
    return () => { scene.fog = null }
  }, [scene])
  return null
}

// ── TUNNEL TRANSITION ─────────────────────────────────────────────────────────

function TunnelTransition({ active, onComplete }) {
  useEffect(() => {
    if (active) {
      const t = setTimeout(onComplete, 850)
      return () => clearTimeout(t)
    }
  }, [active, onComplete])
  if (!active) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'radial-gradient(ellipse at center, #1a0a30 0%, #000 60%)',
      animation: 'tunnelIn 0.85s ease-in forwards',
      pointerEvents: 'none',
    }} />
  )
}

// ── PLATFORM DATA ─────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: 'bio',
    num: '01',
    label: 'BIOGRAPHY',
    kanji: '伝記',
    desc: 'Origin. Memory. Self.',
    color: '#c8b89a',
    glow: 'rgba(200,184,154,0.08)',
    border: 'rgba(200,184,154,0.18)',
  },
  {
    id: 'art',
    num: '02',
    label: 'ART',
    kanji: '芸術',
    desc: 'Illustration & original works.',
    color: '#d4a0b0',
    glow: 'rgba(212,160,176,0.08)',
    border: 'rgba(212,160,176,0.18)',
  },
  {
    id: 'videos',
    num: '03',
    label: 'VIDEO',
    kanji: '映像',
    desc: 'Motion & recorded works.',
    color: '#a0c0d4',
    glow: 'rgba(160,192,212,0.08)',
    border: 'rgba(160,192,212,0.18)',
  },
  {
    id: 'design',
    num: '04',
    label: 'DESIGN',
    kanji: '設計',
    desc: 'Graphic & visual design.',
    color: '#b0d4a8',
    glow: 'rgba(176,212,168,0.08)',
    border: 'rgba(176,212,168,0.18)',
  },
  {
    id: 'story',
    num: '05',
    label: 'STORY',
    kanji: '物語',
    desc: 'Chronicles of the Land of Three.',
    color: '#c8b89a',
    glow: 'rgba(200,184,154,0.08)',
    border: 'rgba(200,184,154,0.18)',
  },
  {
    id: 'index',
    num: '06',
    label: 'INDEX',
    kanji: '神社',
    desc: 'Character shrine & compendium.',
    color: '#c0b0ff',
    glow: 'rgba(192,176,255,0.08)',
    border: 'rgba(192,176,255,0.18)',
  },
  {
    id: 'world',
    num: '07',
    label: 'WORLD',
    kanji: '世界',
    desc: 'Living map of the three realms.',
    color: '#4080ff',
    glow: 'rgba(64,128,255,0.08)',
    border: 'rgba(64,128,255,0.18)',
  },
]

// ── LANDING ───────────────────────────────────────────────────────────────────

export default function Landing({ onEnter }) {
  const [hovered, setHovered] = useState(null)
  const [tunneling, setTunneling] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = (id) => {
    setTunneling(id)
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#06050a',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Space Mono", monospace',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes tunnelIn {
          0% { opacity: 0; transform: scale(0.1) }
          60% { opacity: 1 }
          100% { opacity: 1; transform: scale(3) }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.4 }
          50% { opacity: 0.7 }
        }
        @keyframes scanline {
          0% { top: -2px }
          100% { top: 100% }
        }

        .platform-row {
          position: relative;
          display: grid;
          grid-template-columns: 3.5rem 1px 1fr auto;
          align-items: center;
          gap: 0 1.25rem;
          padding: 0.9rem 1.4rem 0.9rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: background 0.25s;
          overflow: hidden;
        }
        .platform-row::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--row-glow);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .platform-row:hover::before { opacity: 1; }
        .platform-row:hover .platform-label { color: var(--row-color); }
        .platform-row:hover .platform-arrow { opacity: 1; transform: translateX(0); }
        .platform-row:hover .divider-line { background: var(--row-color); opacity: 0.25; }

        .platform-num {
          font-family: 'Space Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.12);
          text-align: right;
          transition: color 0.2s;
        }
        .platform-row:hover .platform-num { color: var(--row-color); opacity: 0.6; }

        .divider-line {
          width: 1px;
          height: 1.8rem;
          background: rgba(255,255,255,0.06);
          transition: all 0.3s;
        }

        .platform-label {
          font-family: 'Noto Serif JP', serif;
          font-size: clamp(0.85rem, 1.4vw, 1.05rem);
          font-weight: 300;
          color: rgba(232,224,208,0.55);
          letter-spacing: 0.06em;
          transition: color 0.25s;
        }

        .platform-meta {
          font-family: 'Space Mono', monospace;
          font-size: 0.5rem;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.2em;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .platform-arrow {
          font-size: 0.7rem;
          color: var(--row-color);
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.3s;
        }

        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #06050a; }
        ::-webkit-scrollbar-thumb { background: #1a1225; }
      `}</style>

      {/* ── 3D BACKGROUND ── */}
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 60 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <StationScene />
        </Suspense>
      </Canvas>

      {/* Grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(6,5,10,0.05) 0%, rgba(6,5,10,0.82) 100%)',
      }} />

      {/* Scanline */}
      <div style={{
        position: 'fixed', left: 0, right: 0, height: '2px', zIndex: 3, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, transparent, rgba(160,130,255,0.04), transparent)',
        animation: 'scanline 9s linear infinite',
      }} />

      {/* ── TOP HEADER ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '1.8rem 2.8rem 1.5rem',
        background: 'linear-gradient(to bottom, rgba(6,5,10,0.97) 60%, transparent)',
        pointerEvents: 'none',
        animation: ready ? 'fadeInDown 0.9s ease forwards' : 'none',
      }}>
        <div>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.5rem',
            color: 'rgba(200,184,154,0.2)',
            letterSpacing: '0.5em',
            marginBottom: '0.45rem',
          }}>// TERMINUS STATION</p>
          <p style={{
            fontFamily: '"Noto Serif JP", serif',
            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
            color: 'rgba(232,224,208,0.85)',
            fontWeight: 300,
            letterSpacing: '0.08em',
          }}>Swift Caulfield</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.45rem',
            color: 'rgba(255,255,255,0.1)',
            letterSpacing: '0.35em',
            marginBottom: '0.3rem',
          }}>PLATFORM DIRECTORY</p>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.45rem',
            color: 'rgba(255,255,255,0.06)',
            letterSpacing: '0.25em',
          }}>01 — 07 DEPARTURES</p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '5.5rem 2.8rem 4rem',
      }}>
        <div style={{
          width: '100%', maxWidth: '780px',
          animation: ready ? 'fadeInUp 1s ease 0.25s both' : 'none',
        }}>

          {/* Board header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingBottom: '0.7rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '0.15rem',
          }}>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.48rem', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.35em' }}>
              PLATFORM
            </p>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.48rem', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.35em' }}>
              DESTINATION
            </p>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.48rem', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.35em' }}>
              STATUS
            </p>
          </div>

          {/* Platform rows */}
          {PLATFORMS.map((p, i) => (
            <div
              key={p.id}
              className="platform-row"
              style={{
                '--row-color': p.color,
                '--row-glow': `linear-gradient(to right, ${p.glow} 0%, transparent 80%)`,
                animationDelay: `${0.35 + i * 0.07}s`,
                animation: ready ? `fadeInUp 0.6s ease ${0.35 + i * 0.07}s both` : 'none',
              }}
              onClick={() => handleEnter(p.id)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Platform number */}
              <p className="platform-num">{p.num}</p>

              {/* Divider */}
              <div className="divider-line" />

              {/* Main label + description */}
              <div>
                <p className="platform-label">{p.label}</p>
                {hovered === p.id && (
                  <p style={{
                    fontFamily: '"Space Mono", monospace',
                    fontSize: '0.48rem',
                    color: p.color,
                    opacity: 0.45,
                    letterSpacing: '0.18em',
                    marginTop: '0.25rem',
                    animation: 'fadeIn 0.2s ease',
                  }}>{p.desc}</p>
                )}
              </div>

              {/* Meta + status */}
              <div className="platform-meta">
                <span style={{ color: p.color, opacity: 0.3, fontFamily: '"Noto Serif JP", serif', fontSize: '0.7rem' }}>
                  {p.kanji}
                </span>
                <span style={{
                  color: p.color, opacity: 0.55,
                  fontSize: '0.45rem', letterSpacing: '0.2em',
                }}>
                  OPEN
                </span>
                <span className="platform-arrow">→</span>
              </div>
            </div>
          ))}

          {/* Footer rule */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', marginTop: '0.15rem', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: '"Noto Serif JP", serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.04)', letterSpacing: '0.3em' }}>終着駅</p>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.44rem', color: 'rgba(255,255,255,0.06)', letterSpacing: '0.25em', animation: 'breathe 4s ease infinite' }}>
              // SELECT A PLATFORM TO DEPART
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TICKER ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        borderTop: '1px solid rgba(255,255,255,0.03)',
        background: 'rgba(6,5,10,0.9)',
        overflow: 'hidden',
        height: '1.8rem',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          display: 'flex', gap: '4rem',
          animation: 'tickerScroll 35s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {[...Array(2)].map((_, rep) =>
            PLATFORMS.map((p) => (
              <span key={`${rep}-${p.id}`} style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.42rem',
                color: 'rgba(255,255,255,0.07)',
                letterSpacing: '0.3em',
              }}>
                PLT.{p.num} {p.label} ○
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── TUNNEL TRANSITION ── */}
      <TunnelTransition
        active={!!tunneling}
        onComplete={() => { onEnter(tunneling); setTunneling(null) }}
      />
    </div>
  )
}
