import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'

function ShrineScene() {
  const glowRef = useRef()

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.intensity = 0.6 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15
    }
  })

  return (
    <group>
      {/* Stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050507" roughness={0.95} />
      </mesh>

      {/* Stone tiles */}
      {Array.from({ length: 8 }).map((_, i) =>
        Array.from({ length: 8 }).map((_, j) => (
          <mesh key={`${i}${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 4) * 2.5, -2.49, (j - 4) * 2.5]}>
            <planeGeometry args={[2.45, 2.45]} />
            <meshStandardMaterial color={`hsl(240, 5%, ${3 + ((i + j) % 2)}%)`} roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Back wall / torii-inspired structure */}
      <mesh position={[0, 2, -9]}>
        <boxGeometry args={[30, 14, 0.2]} />
        <meshStandardMaterial color="#030305" roughness={1} />
      </mesh>

      {/* Torii gate posts */}
      <mesh position={[-4, 0, -7]}>
        <boxGeometry args={[0.3, 7, 0.3]} />
        <meshStandardMaterial color="#0d0d14" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[4, 0, -7]}>
        <boxGeometry args={[0.3, 7, 0.3]} />
        <meshStandardMaterial color="#0d0d14" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, 3.7, -7]}>
        <boxGeometry args={[9, 0.25, 0.3]} />
        <meshStandardMaterial color="#0d0d14" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 3.1, -7]}>
        <boxGeometry args={[8.2, 0.15, 0.25]} />
        <meshStandardMaterial color="#0d0d14" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Shrine lanterns */}
      {[[-5, 0, -4], [5, 0, -4], [-5, 0, -8], [5, 0, -8]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.6, 0.5]} />
            <meshStandardMaterial color="#0a0a10" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.35, 0.45, 0.35]} />
            <meshStandardMaterial color="#e8e0ff" emissive="#a090ff" emissiveIntensity={0.3} transparent opacity={0.6} />
          </mesh>
          <pointLight position={[0, 0, 0]} intensity={0.4} distance={5} color="#a090ff" decay={2} />
        </group>
      ))}

      {/* Central altar glow */}
      <pointLight ref={glowRef} position={[0, -1, -7]} intensity={0.6} distance={10} color="#8070ff" decay={2} />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <FloatingOrb key={i} index={i} />
      ))}

      <ambientLight intensity={0.015} color="#302040" />
    </group>
  )
}

function FloatingOrb({ index }) {
  const ref = useRef()
  const speed = 0.2 + Math.random() * 0.3
  const radius = 2 + Math.random() * 5
  const offset = (index / 20) * Math.PI * 2
  const height = -1 + Math.random() * 3

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.cos(state.clock.elapsedTime * speed + offset) * radius
      ref.current.position.z = Math.sin(state.clock.elapsedTime * speed + offset) * radius - 5
      ref.current.position.y = height + Math.sin(state.clock.elapsedTime * 0.5 + offset) * 0.3
      ref.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime + offset) * 0.1
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshBasicMaterial color="#c0b0ff" transparent opacity={0.2} />
    </mesh>
  )
}

function CameraFloat() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.6
    state.camera.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 0.07) * 0.2
    state.camera.lookAt(0, 0, -5)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#040408', 0.055)
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

function CharacterCard({ char, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onClick(char)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        aspectRatio: '2/3',
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(192,176,255,0.4)' : 'rgba(192,176,255,0.08)'}`,
        transition: 'all 0.4s',
        background: '#06060d',
      }}
    >
      {/* Character image */}
      {char.image_url ? (
        <img src={char.image_url} alt={char.name} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          filter: hovered ? 'grayscale(0%) brightness(1)' : 'grayscale(40%) brightness(0.6)',
          transition: 'all 0.5s',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
        }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,176,255,0.2)', letterSpacing: '0.3em' }}>// NO IMAGE</p>
        </div>
      )}

      {/* Gacha card overlay — always visible but more opaque on hover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered
          ? 'linear-gradient(to top, rgba(4,4,12,0.95) 0%, rgba(4,4,12,0.4) 50%, transparent 100%)'
          : 'linear-gradient(to top, rgba(4,4,12,0.7) 0%, transparent 60%)',
        transition: 'all 0.4s',
      }} />

      {/* Shimmer effect on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, transparent 30%, rgba(192,176,255,0.06) 50%, transparent 70%)',
          animation: 'shimmer 1.5s ease infinite',
        }} />
      )}

      {/* Type badge */}
      <div style={{
        position: 'absolute', top: '0.75rem', right: '0.75rem',
        fontFamily: '"Space Mono",monospace',
        fontSize: '0.5rem',
        color: char.type === 'original' ? 'rgba(192,176,255,0.7)' : 'rgba(200,184,154,0.7)',
        border: `1px solid ${char.type === 'original' ? 'rgba(192,176,255,0.2)' : 'rgba(200,184,154,0.2)'}`,
        padding: '0.2rem 0.4rem',
        letterSpacing: '0.15em',
        background: 'rgba(4,4,12,0.6)',
      }}>
        {char.type === 'original' ? 'OC' : 'CM'}
      </div>

       {/* Name — slides up on hover */}
       <div style={{
         position: 'absolute', bottom: 0, left: 0, right: 0,
         padding: '1rem 0.75rem',
         transform: hovered ? 'translateY(0)' : 'translateY(4px)',
         transition: 'transform 0.3s',
       }}>
         <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.9rem', color: '#e8e0f0', fontWeight: 300, marginBottom: '0.2rem' }}>{char.name}</p>
         <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,176,255,0.5)', letterSpacing: '0.15em', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>{char.role}</p>
         {char.daily_activity && (
           <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.45rem', color: 'rgba(192,176,255,0.3)', letterSpacing: '0.1em', fontStyle: 'italic', marginTop: '0.3rem' }}>
             {char.daily_activity}
           </p>
         )}
       </div>
    </div>
  )
}

export default function Index({ onBack }) {
  const [characters, setCharacters] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [tunneling, setTunneling] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/api/characters').then(r => { setCharacters(Array.isArray(r.data) ? r.data : []); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  const filtered = filter === 'all' ? characters : characters.filter(c => c.type === filter)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#04040a', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .return-btn { background:transparent; border:1px solid rgba(192,176,255,0.2); color:#c0b0ff; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.6rem 1.2rem; cursor:pointer; transition:all 0.3s; }
        .return-btn:hover { border-color:rgba(192,176,255,0.5); }
        .filter-btn { background:transparent; border:1px solid rgba(192,176,255,0.1); color:rgba(192,176,255,0.4); font-family:'Space Mono',monospace; font-size:0.55rem; letter-spacing:0.2em; padding:0.4rem 0.8rem; cursor:pointer; transition:all 0.2s; }
        .filter-btn.active { border-color:rgba(192,176,255,0.4); color:rgba(192,176,255,0.9); }
        ::-webkit-scrollbar { width:2px; } ::-webkit-scrollbar-track { background:#04040a; } ::-webkit-scrollbar-thumb { background:#1a1428; }
      `}</style>

      <Canvas camera={{ position: [0, 0.3, 7], fov: 65 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <ShrineScene />
        </Suspense>
      </Canvas>

      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(4,4,10,0.15) 0%, rgba(4,4,10,0.85) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', background: 'linear-gradient(to bottom, rgba(4,4,10,0.95), transparent)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'all', animation: 'fadeInUp 0.8s ease forwards' }}>
          <button className="return-btn" onClick={() => setTunneling(true)}>← STATION</button>
        </div>
        <div>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,176,255,0.2)', letterSpacing: '0.4em' }}>// PLATFORM 06 — INDEX</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, overflowY: 'auto', paddingTop: '6rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem' }}>

          {/* Title + filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', animation: 'fadeInUp 0.8s ease forwards', animationDelay: '0.2s', opacity: 0 }}>
            <div>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,176,255,0.25)', letterSpacing: '0.5em', marginBottom: '0.5rem' }}>// THE LAND OF THREE</p>
              <h1 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: '#e8e0f8', fontWeight: 300 }}>Character Index</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'original', 'commissioned'].map(f => (
                <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'ALL' : f === 'original' ? 'OC' : 'CM'}
                </button>
              ))}
            </div>
          </div>

          {loaded && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.65rem', color: 'rgba(192,176,255,0.1)', letterSpacing: '0.3em' }}>// NO CHARACTERS RECORDED IN THE INDEX</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '3px', animation: 'fadeIn 0.8s ease forwards', animationDelay: '0.4s', opacity: 0 }}>
            {filtered.map(char => (
              <CharacterCard key={char.id} char={char} onClick={setSelected} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.75rem', color: 'rgba(192,176,255,0.06)', letterSpacing: '0.3em' }}>神社</p>
          </div>
        </div>
      </div>

      {/* Character detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,4,10,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', animation: 'fadeIn 0.3s ease', cursor: 'pointer' }}>
          <div onClick={e => e.stopPropagation()} style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem', maxWidth: '800px', width: '100%', cursor: 'default' }}>
            <div style={{ aspectRatio: '2/3', overflow: 'hidden', border: '1px solid rgba(192,176,255,0.15)' }}>
              {selected.image_url
                ? <img src={selected.image_url} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: '#06060d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,176,255,0.15)' }}>// NO IMAGE</p></div>
              }
            </div>
            <div style={{ paddingTop: '1rem' }}>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,176,255,0.3)', letterSpacing: '0.4em', marginBottom: '0.75rem' }}>
                {selected.type === 'original' ? '// ORIGINAL CHARACTER' : '// COMMISSIONED'}
              </p>
              <h2 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: '#e8e0f8', fontWeight: 300, marginBottom: '0.4rem' }}>{selected.name}</h2>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.7rem', color: 'rgba(192,176,255,0.4)', letterSpacing: '0.15em', marginBottom: '2rem' }}>{selected.role}</p>

              <div style={{ width: '32px', height: '1px', background: 'rgba(192,176,255,0.2)', marginBottom: '1.5rem' }} />

               {selected.backstory && <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.95rem', color: 'rgba(232,224,248,0.6)', lineHeight: 2, fontWeight: 300, marginBottom: '1.5rem' }}>{selected.backstory}</p>}
               {selected.lore && <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.95rem', color: 'rgba(232,224,248,0.6)', lineHeight: 2, fontWeight: 300, marginBottom: '1.5rem' }}>{selected.lore}</p>}
               {selected.daily_activity && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.75rem', color: 'rgba(192,176,255,0.4)', letterSpacing: '0.1em', marginBottom: '1.5rem', fontStyle: 'italic' }}>{selected.daily_activity}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               {selected.birth_city && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', color: 'rgba(192,176,255,0.3)', letterSpacing: '0.15em' }}>ORIGIN // {selected.birth_city}</p>}
                {selected.story_ref && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', color: 'rgba(192,176,255,0.3)', letterSpacing: '0.15em' }}>STORY // {selected.story_ref}</p>}
                {selected.first_appearance && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', color: 'rgba(192,176,255,0.3)', letterSpacing: '0.15em' }}>FIRST SEEN // {selected.first_appearance}</p>}
              </div>

              <button onClick={() => setSelected(null)} style={{ marginTop: '2rem', background: 'transparent', border: '1px solid rgba(192,176,255,0.15)', color: 'rgba(192,176,255,0.5)', fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
