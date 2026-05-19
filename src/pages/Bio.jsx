import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'

function WaitingRoom() {
  const lampRef = useRef()
  const lightRef = useRef()
  const [flicker, setFlicker] = useState(1)

  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() > 0.92) {
        setFlicker(0.3)
        setTimeout(() => setFlicker(1), 60)
        setTimeout(() => setFlicker(0.6), 120)
        setTimeout(() => setFlicker(1), 200)
      }
    }, 3000)
    return () => clearInterval(iv)
  }, [])

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = flicker * 1.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0a0804" roughness={0.95} />
      </mesh>

      {/* Floor boards */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 6) * 0.8, -2.49, 0]}>
          <planeGeometry args={[0.76, 30]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#0d0a07' : '#0a0804'} roughness={1} />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 2, -8]}>
        <boxGeometry args={[30, 12, 0.2]} />
        <meshStandardMaterial color="#080604" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-8, 2, 0]}>
        <boxGeometry args={[0.2, 12, 30]} />
        <meshStandardMaterial color="#070503" roughness={1} />
      </mesh>

      {/* Right wall */}
      <mesh position={[8, 2, 0]}>
        <boxGeometry args={[0.2, 12, 30]} />
        <meshStandardMaterial color="#070503" roughness={1} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#050402" roughness={1} />
      </mesh>

      {/* Bench */}
      <group position={[-2, -1.8, -5]}>
        <mesh>
          <boxGeometry args={[3, 0.12, 0.7]} />
          <meshStandardMaterial color="#1a1208" roughness={0.8} metalness={0.1} />
        </mesh>
        {[-1.2, 1.2].map((x, i) => (
          <mesh key={i} position={[x, -0.4, 0]}>
            <boxGeometry args={[0.1, 0.7, 0.7]} />
            <meshStandardMaterial color="#141008" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Hanging lamp */}
      <group position={[0, 5, -3]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh ref={lampRef} position={[0, -1, 0]}>
          <coneGeometry args={[0.4, 0.5, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.85, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#fff9e0" emissive="#fff5cc" emissiveIntensity={flicker} />
        </mesh>
        <pointLight ref={lightRef} position={[0, -1, 0]} intensity={1.2} distance={10} color="#c8a96e" decay={2} />
      </group>

      {/* Second lamp far back */}
      <group position={[3, 5, -7]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <pointLight position={[0, -1, 0]} intensity={0.3} distance={6} color="#a08050" decay={2} />
      </group>

      {/* Old clock on wall */}
      <group position={[0, 1.5, -7.8]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.08, 32]} />
          <meshStandardMaterial color="#1a1208" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <cylinderGeometry args={[0.55, 0.55, 0.02, 32]} />
          <meshStandardMaterial color="#0d0a06" roughness={0.5} />
        </mesh>
      </group>

      {/* Mist particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <MistParticle key={i} index={i} />
      ))}

      <ambientLight intensity={0.02} color="#c8a96e" />
    </group>
  )
}

function MistParticle({ index }) {
  const ref = useRef()
  const speed = 0.05 + Math.random() * 0.05
  const offset = Math.random() * Math.PI * 2

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(state.clock.elapsedTime * speed + offset) * 4 + (Math.random() - 0.5) * 0.01
      ref.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 0.2 + offset) * 0.5
      ref.current.material.opacity = 0.015 + Math.sin(state.clock.elapsedTime * 0.3 + offset) * 0.01
    }
  })

  return (
    <mesh
      ref={ref}
      position={[
        (Math.random() - 0.5) * 10,
        -1.5,
        (Math.random() - 0.5) * 8 - 3,
      ]}
    >
      <planeGeometry args={[3 + Math.random() * 2, 0.8 + Math.random()]} />
      <meshBasicMaterial color="#c8a96e" transparent opacity={0.015} depthWrite={false} />
    </mesh>
  )
}

function CameraFloat() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.3
    state.camera.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 0.1) * 0.15
    state.camera.lookAt(0, 0.5, -4)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#080604', 0.08)
    return () => { scene.fog = null }
  }, [scene])
  return null
}

function TunnelBack({ active, onComplete }) {
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
      animation: 'tunnelExpand 0.9s cubic-bezier(0.4,0,1,1) forwards',
    }} />
  )
}

export default function Bio({ onBack }) {
  const [bio, setBio] = useState(null)
  const [typed, setTyped] = useState('')
  const [tunneling, setTunneling] = useState(false)

  useEffect(() => {
    api.get('/api/bio').then(r => setBio(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const text = bio?.bio_text || 'Artist. Illustrator. Creator of dark, intricate worlds beneath the surface.'
    setTyped('')
    let i = 0
    const t = setInterval(() => {
      setTyped(text.slice(0, i))
      i++
      if (i > text.length) clearInterval(t)
    }, 30)
    return () => clearInterval(t)
  }, [bio])

  const tags = (bio?.tags || 'Illustration, Concept Art, Graphic Design, Digital Art').split(',').map(t => t.trim())

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#080604', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes tunnelExpand { from{opacity:0} to{opacity:1} }
        @keyframes grain { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-1%,-1%)} 50%{transform:translate(1%,1%)} }
        .return-btn { background:transparent; border:1px solid rgba(200,184,154,0.2); color:#c8b89a; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.6rem 1.2rem; cursor:pointer; transition:all 0.3s; }
        .return-btn:hover { border-color:rgba(200,184,154,0.6); opacity:1; }
      `}</style>

      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0.5, 5], fov: 65 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <WaitingRoom />
        </Suspense>
      </Canvas>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(4,3,2,0.85) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* UI Overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>

        {/* Left — return */}
        <div style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', pointerEvents: 'all', animation: 'fadeInUp 0.8s ease forwards' }}>
          <button className="return-btn" onClick={() => setTunneling(true)}>← STATION</button>
        </div>

        {/* Platform label */}
        <div style={{ position: 'absolute', top: '2.5rem', right: '2.5rem', animation: 'fadeInUp 0.8s ease forwards' }}>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.25)', letterSpacing: '0.4em' }}>// PLATFORM 01 — BIO</p>
        </div>

        {/* Content card — right side */}
        <div style={{
          position: 'absolute', right: '4rem', top: '50%', transform: 'translateY(-50%)',
          width: 'min(420px, 38vw)',
          pointerEvents: 'all',
          animation: 'fadeInUp 1s ease forwards',
          animationDelay: '0.3s',
          opacity: 0,
        }}>
          {/* PFP */}
          {bio?.pfp_url && (
            <div style={{ width: '80px', height: '80px', marginBottom: '1.5rem', overflow: 'hidden', border: '1px solid rgba(200,184,154,0.15)' }}>
              <img src={bio.pfp_url} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }} />
            </div>
          )}

          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.3)', letterSpacing: '0.5em', marginBottom: '0.75rem' }}>// IDENTITY</p>

          <h1 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: '#e8e0d0', fontWeight: 300, lineHeight: 1.2, marginBottom: '0.4rem' }}>
            {bio?.name || 'Swift Caulfield'}
          </h1>

          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.7rem', color: 'rgba(200,184,154,0.45)', letterSpacing: '0.2em', marginBottom: '2rem' }}>
            {bio?.role || 'Artist / Illustrator'}
          </p>

          <div style={{ width: '32px', height: '1px', background: 'rgba(200,184,154,0.25)', marginBottom: '1.5rem' }} />

          <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.95rem', color: 'rgba(232,224,208,0.65)', lineHeight: 1.95, fontWeight: 300, minHeight: '2.5em' }}>
            {typed}<span style={{ animation: 'blink 1s step-end infinite', color: 'rgba(200,184,154,0.5)' }}>_</span>
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {tags.map(tag => (
              <span key={tag} style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(200,184,154,0.4)', border: '1px solid rgba(200,184,154,0.12)', padding: '0.25rem 0.6rem', letterSpacing: '0.15em' }}>
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom left — Japanese */}
        <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem' }}>
          <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.8rem', color: 'rgba(200,184,154,0.15)', letterSpacing: '0.2em' }}>待合室</p>
        </div>
      </div>

      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
