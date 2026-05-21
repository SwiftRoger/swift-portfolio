import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'

function GalleryScene({ artItems }) {
  return (
    <group>
      {/* Floor — polished dark marble */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#030303" roughness={0.05} metalness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#000" roughness={1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -9]}>
        <boxGeometry args={[40, 16, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-10, 1.5, 0]}>
        <boxGeometry args={[0.2, 16, 40]} />
        <meshStandardMaterial color="#040404" roughness={1} />
      </mesh>
      <mesh position={[10, 1.5, 0]}>
        <boxGeometry args={[0.2, 16, 40]} />
        <meshStandardMaterial color="#040404" roughness={1} />
      </mesh>

      {/* Floating frame placeholders on walls */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`left${i}`} position={[-9.7, 0.5, -2 - i * 5]}>
          <mesh>
            <boxGeometry args={[0.05, 2.2, 1.8]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>
          <pointLight position={[0.5, 1.5, 0]} intensity={0.4} distance={4} color="#fff" />
        </group>
      ))}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`right${i}`} position={[9.7, 0.5, -2 - i * 5]}>
          <mesh>
            <boxGeometry args={[0.05, 2.2, 1.8]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>
          <pointLight position={[-0.5, 1.5, 0]} intensity={0.4} distance={4} color="#fff" />
        </group>
      ))}

      {/* Ceiling spotlights */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`spot${i}`} position={[(i % 2 === 0 ? -3 : 3), 4.8, -i * 4 - 1]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.12, 0.2, 8]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
          </mesh>
          <spotLight
            position={[0, -0.1, 0]}
            target-position={[0, -3, 0]}
            intensity={2}
            distance={8}
            angle={0.3}
            penumbra={0.5}
            color="#f0f0f0"
          />
        </group>
      ))}

      <ambientLight intensity={0.015} color="#ffffff" />
    </group>
  )
}

function CameraGlide() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 1.5
    state.camera.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 0.05) * 0.2
    state.camera.lookAt(0, 0, -5)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#000000', 0.05)
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

export default function Art({ onBack }) {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [tunneling, setTunneling] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/api/characters').then(r => { setCharacters(Array.isArray(r.data) ? r.data : []); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .art-thumb { cursor:pointer; overflow:hidden; break-inside:avoid; margin-bottom:3px; transition:opacity 0.3s; }
        .art-thumb:hover { opacity:0.85; }
        .art-thumb img { width:100%; display:block; filter:grayscale(15%) contrast(1.05); transition:transform 0.6s; }
        .art-thumb:hover img { transform:scale(1.03); }
        .return-btn { background:transparent; border:1px solid rgba(255,255,255,0.15); color:#fff; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.6rem 1.2rem; cursor:pointer; transition:all 0.3s; }
        .return-btn:hover { border-color:rgba(255,255,255,0.5); }
        ::-webkit-scrollbar { width:2px; } ::-webkit-scrollbar-track { background:#000; } ::-webkit-scrollbar-thumb { background:#222; }
      `}</style>

      {/* 3D Gallery background */}
      <Canvas camera={{ position: [0, 0.3, 6], fov: 70 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraGlide />
          <GalleryScene artItems={items} />
        </Suspense>
      </Canvas>

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Fixed header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'all', animation: 'fadeInUp 0.8s ease forwards' }}>
          <button className="return-btn" onClick={() => setTunneling(true)}>← STATION</button>
        </div>
        <div style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.4em' }}>// PLATFORM 02 — ART</p>
        </div>
      </div>

      {/* Scrollable art grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10,
        overflowY: 'auto',
        paddingTop: '6rem',
        paddingBottom: '3rem',
      }}>
        {loaded && items.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em' }}>// NO ART UPLOADED YET</p>
          </div>
        )}
        {items.length > 0 && (
          <div style={{ columns: 3, columnGap: '3px', padding: '0 3rem', animation: 'fadeIn 0.8s ease forwards', animationDelay: '0.3s', opacity: 0 }}>
            {items.map((item, i) => (
              <div key={item.id} className="art-thumb" onClick={() => setSelected(item)} style={{ animationDelay: `${i * 0.04}s` }}>
                <img src={item.image_url} alt={item.title} />
              </div>
            ))}
          </div>
        )}
        {/* Bottom label */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.08)', letterSpacing: '0.3em' }}>画廊</p>
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.3s ease' }}>
          <img src={selected.image_url} alt={selected.title} style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain' }} />
          <p style={{ position: 'absolute', bottom: '2rem', fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.3em' }}>
            {selected.title.toUpperCase()} // CLICK TO CLOSE
          </p>
        </div>
      )}

      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
