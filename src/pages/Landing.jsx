import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAuth } from '../contexts/AuthContext'

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
      {[0, 1, 2, 3].map((i) => (
        <group key={`ll${i}`} position={[-11.5, 1.5, -10 + i * 5]}>
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
      ))}

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

// ── DATA ─────────────────────────────────────────────────────────────────────

const PORTALS = [
  {
    id: 'index',
    title: 'Character',
    sub: 'Explore the people',
    gradient: 'radial-gradient(ellipse at 40% 35%, #1a1428 0%, #0a0810 60%, #06050a 100%)',
  },
  {
    id: 'story',
    title: 'Story',
    sub: 'Explore the narrative',
    gradient: 'radial-gradient(ellipse at 40% 35%, #1a1020 0%, #0d0a0f 60%, #06050a 100%)',
  },
  {
    id: 'world',
    title: 'World',
    sub: 'Explore the universe',
    gradient: 'radial-gradient(ellipse at 40% 35%, #0e1420 0%, #080c14 60%, #06050a 100%)',
  },
]

const ICONS = [
  {
    id: 'bio',
    label: 'Biography',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    id: 'art',
    label: 'Art',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  {
    id: 'videos',
    label: 'Video',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  },
  {
    id: 'design',
    label: 'Design',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
  {
    id: 'auth',
    label: 'Identity',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01M12 16h.01M11.012 14a2 2 0 100-4 2 2 0 000 4z"/></svg>,
  }
]

// ── LANDING ───────────────────────────────────────────────────────────────────

export default function Landing({ onEnter }) {
  const [hovered, setHovered] = useState(null)
  const [tunneling, setTunneling] = useState(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setLoading(false)

      setTimeout(() => {
        setReady(true)
      }, 50)

    }, 1800)

    return () => clearTimeout(loadingTimer)
  }, [])

  return (
  <>
    {loading && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#06050a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          color: 'rgba(232,224,208,0.8)',
          letterSpacing: '0.3em',
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.7rem',
        }}
      >
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            borderTop: '1px solid rgba(255,255,255,0.6)',
            animation: 'spinLoader 1.2s linear infinite',
          }}
        />

        <p>INITIALIZING TERMINUS STATION</p>
      </div>
    )}

    <div style={{
      width: '100vw', height: '100vh',
      background: '#06050a',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Space Mono", monospace',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400;600&family=Cormorant+Garamond:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes portalRise { from { opacity: 0; transform: translateY(50px) scale(0.93) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes iconRise { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes breathe { 0%,100% { opacity: 0.3 } 50% { opacity: 0.7 } }
        @keyframes scanline { 0% { top: -2px } 100% { top: 100% } }
        @keyframes tunnelIn { 0% { opacity:0; transform:scale(0.1) } 60% { opacity:1 } 100% { opacity:1; transform:scale(3) } }
        @keyframes rimPulse { 0%,100% { box-shadow: 0 0 20px rgba(255,255,255,0.04), inset 0 0 30px rgba(0,0,0,0.8) } 50% { box-shadow: 0 0 35px rgba(255,255,255,0.08), inset 0 0 30px rgba(0,0,0,0.8) } }
        @keyframes diamondPulse { 0%,100% { opacity:0.4; transform:rotate(45deg) scale(1) } 50% { opacity:0.9; transform:rotate(45deg) scale(1.4) } }
        @keyframes spinLoader {
        from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
          }
        @media (max-width: 600px) {
          .icon-ring { width: 52px !important; height: 52px !important; }
          .icon-ring svg { width: 18px !important; height: 18px !important; }
          .portal-title { font-size: clamp(0.8rem, 3vw, 1.2rem) !important; }
        }  

        .portal {
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          animation: rimPulse 4s ease infinite;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.4s ease, box-shadow 0.4s ease;
        }
        .portal:hover {
          transform: scale(1.04) !important;
          box-shadow: 0 0 60px rgba(255,255,255,0.1), 0 0 120px rgba(200,180,255,0.05), inset 0 0 40px rgba(0,0,0,0.5) !important;
        }
        .portal-inner {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.5rem;
          z-index: 2;
        }
        .portal-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(232,224,208,0.85);
          text-transform: uppercase;
          transition: color 0.3s, letter-spacing 0.4s;
        }
        .portal:hover .portal-title { color: #fff; letter-spacing: 0.28em; }
        .portal-diamond {
          width: 5px; height: 5px;
          background: rgba(232,224,208,0.45);
          transform: rotate(45deg);
          animation: diamondPulse 2.5s ease infinite;
          transition: background 0.3s;
        }
        .portal:hover .portal-diamond { background: rgba(255,255,255,0.9); }
        .portal-sub {
          font-family: 'Space Mono', monospace;
          font-size: 0.48rem;
          letter-spacing: 0.28em;
          color: rgba(200,184,154,0.35);
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .portal:hover .portal-sub { color: rgba(200,184,154,0.75); }

        .icon-btn {
          display: flex; flex-direction: column;
          align-items: center; gap: 0.65rem;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.23,1,0.32,1);
        }
        .icon-btn:hover { transform: translateY(-5px); }
        .icon-ring {
          width: 68px; height: 68px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(6,5,10,0.6);
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
        }
        .icon-btn:hover .icon-ring {
          border-color: rgba(255,255,255,0.3);
          background: rgba(20,16,30,0.9);
          box-shadow: 0 0 20px rgba(200,180,255,0.08);
        }
        .icon-ring svg {
          width: 22px; height: 22px;
          color: rgba(200,184,154,0.5);
          transition: color 0.3s;
        }
        .icon-btn:hover .icon-ring svg { color: rgba(232,224,208,0.95); }
        .icon-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.46rem;
          letter-spacing: 0.28em;
          color: rgba(200,184,154,0.3);
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .icon-btn:hover .icon-label { color: rgba(200,184,154,0.75); }
      `}</style>

      {/* 3D Background */}
      <Canvas camera={{ position: [0, 0.5, 8], fov: 60 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <StationScene />
        </Suspense>
      </Canvas>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(6,5,10,0.05) 0%, rgba(6,5,10,0.85) 100%)' }} />

      {/* Scanline */}
      <div style={{ position: 'fixed', left: 0, right: 0, height: '2px', zIndex: 3, pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent, rgba(160,130,255,0.04), transparent)', animation: 'scanline 9s linear infinite' }} />

       {/* Header */}
       <div style={{
         position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
         display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
         padding: '1.8rem 2.5rem 1.5rem',
         background: 'linear-gradient(to bottom, rgba(6,5,10,0.97) 60%, transparent)',
         pointerEvents: 'none',
         animation: ready ? 'fadeInDown 0.9s ease forwards' : 'none',
       }}>
         <div>
           <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.48rem', color: 'rgba(200,184,154,0.25)', letterSpacing: '0.5em', marginBottom: '0.4rem' }}>// TERMINUS STATION</p>
           <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.2rem,2vw,1.6rem)', color: 'rgba(232,224,208,0.9)', fontWeight: 300, letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Swift Caulfield</p>
           <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.42rem', color: 'rgba(200,184,154,0.15)', letterSpacing: '0.35em' }}>EXPLORE. DISCOVER. REMEMBER.</p>
         </div>
         <div style={{ textAlign: 'right' }}>
           {/* User profile when logged in */}
           {user && (
             <div style={{ position: 'relative', pointerEvents: 'all' }}
               onMouseEnter={e => e.currentTarget.querySelector('.identity-dropdown').style.opacity = '1'}
               onMouseLeave={e => e.currentTarget.querySelector('.identity-dropdown').style.opacity = '0'}
             >
               <div onClick={() => onEnter('profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                 onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
               >
                 {user.avatar_url && user.avatar_approved && (
                   <img src={user.avatar_url} alt="Avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 0 12px rgba(200,180,255,0.2)', animation: 'breathe 3s ease infinite' }} />
                 )}
                 <div>
                   <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.45rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.35em', marginBottom: '0.2rem' }}>// IDENTITY</p>
                   <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '1rem', color: 'rgba(232,224,208,0.75)', letterSpacing: '0.15em', fontWeight: 300 }}>{user.username}</p>
                 </div>
               </div>
               <div className="identity-dropdown" style={{ opacity: 0, transition: 'opacity 0.2s', position: 'absolute', top: '100%', right: 0, marginTop: '0.25rem', background: 'rgba(6,5,10,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', minWidth: '140px', zIndex: 100 }}>
                 <div onClick={() => onEnter('profile')} style={{ padding: '0.65rem 1rem', fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.7)', letterSpacing: '0.2em', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                 >PROFILE</div>
                 <div onClick={() => { localStorage.removeItem('portfolio_token'); window.location.reload(); }} style={{ padding: '0.65rem 1rem', fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(255,100,100,0.6)', letterSpacing: '0.2em', cursor: 'pointer', transition: 'background 0.15s' }}
                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,60,60,0.08)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                 >LOGOUT</div>
               </div>
             </div>
           )}
           {/* Platform directory when not logged in */}
           {!user && (
             <>
               <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.44rem', color: 'rgba(255,255,255,0.08)', letterSpacing: '0.35em', marginBottom: '0.25rem' }}>PLATFORM DIRECTORY</p>
               <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.44rem', color: 'rgba(255,255,255,0.05)', letterSpacing: '0.25em' }}>01 — 07 DEPARTURES</p>
             </>
           )}
         </div>
       </div>

      {/* Main */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '5rem 2rem 2rem',
        gap: '2.5rem',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>

        {/* 3 Portals */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.5rem, 2vw, 1.8rem)' }}>
          {PORTALS.map((p, i) => {
            const isCenter = p.id === 'story'
            const size = isCenter ? 'min(320px, 38vw)' : 'min(220px, 26vw)'
            const faded = hovered && hovered !== p.id
            return (
              <div
                key={p.id}
                className="portal"
                onClick={() => onEnter(p.id)}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: size, height: size,
                  background: p.gradient,
                  border: `1px solid rgba(255,255,255,${isCenter ? 0.15 : 0.08})`,
                  boxShadow: `0 0 ${isCenter ? 50 : 25}px rgba(0,0,0,0.9), inset 0 0 ${isCenter ? 40 : 20}px rgba(0,0,0,0.7)`,
                  opacity: faded ? 0.45 : 1,
                  transform: faded ? 'scale(0.96)' : 'scale(1)',
                  animation: ready ? `portalRise 0.9s cubic-bezier(0.23,1,0.32,1) ${0.3 + i * 0.1}s both` : 'none',
                }}
              >
                {/* Rim highlight */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.04), transparent 60%)', zIndex: 1, pointerEvents: 'none' }} />
                {/* Bottom shadow */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.5), transparent 60%)', zIndex: 1, pointerEvents: 'none' }} />
                <div className="portal-inner">
                  <p className="portal-title" style={{ fontSize: isCenter ? 'clamp(1.5rem,2.5vw,2rem)' : 'clamp(1rem,1.8vw,1.3rem)' }}>{p.title}</p>
                  <div className="portal-diamond" />
                  <p className="portal-sub">{p.sub}</p>
                </div>
              </div>
            )
          })}
        </div>

       {/* BEGIN YOUR JOURNEY — only for guests */}
        {!user && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', animation: ready ? 'iconRise 0.7s ease 0.5s both' : 'none' }}>
            <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', letterSpacing: '0.45em', color: 'rgba(200,184,154,0.4)', animation: 'breathe 3s ease infinite' }}>// BEGIN YOUR JOURNEY</p>
            <div className="icon-btn" onClick={() => onEnter('auth')} style={{ transform: 'scale(1.3)', marginBottom: '0.5rem' }}>
              <div className="icon-ring" style={{ width: '88px', height: '88px', border: '1px solid rgba(200,180,255,0.25)', boxShadow: '0 0 30px rgba(160,130,255,0.12)', animation: 'rimPulse 3s ease infinite' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px', color: 'rgba(200,184,154,0.7)' }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              <p className="icon-label" style={{ fontSize: '0.5rem', color: 'rgba(200,184,154,0.5)', letterSpacing: '0.3em' }}>IDENTITY</p>
            </div>
          </div>
        )}

        {/* 4 Icon buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.75rem, 3vw, 2rem)', flexWrap: 'wrap', padding: '0 1rem', animation: ready ? 'iconRise 0.7s ease 0.65s both' : 'none' }}>
          {ICONS.map((item) => {
            if (item.id === 'auth' && !user) return null
            return (
              <div key={item.id} className="icon-btn" onClick={() => onEnter(item.id === 'auth' && user ? 'profile' : item.id)}>
                <div className="icon-ring">{item.svg}</div>
                <p className="icon-label">{item.label}</p>
              </div>
            )
          })}
        </div>

      </div>

      {/* Tunnel */}
      {tunneling && (() => { onEnter(tunneling); setTunneling(null); return null; })()}
        </div>
  </>
  )
}