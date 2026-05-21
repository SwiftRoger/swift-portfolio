import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'

function ArchitectStudio() {
  const lampRef = useRef()
  const lightRef = useRef()
  const blueprintRef = useRef()

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
    if (blueprintRef.current) {
      blueprintRef.current.material.emissiveIntensity = 0.04 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01
    }
  })

  return (
    <group>
      {/* Floor — dark concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#080808" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* Floor grid — blueprint style */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`fg${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.49, (i - 10) * 2]}>
          <planeGeometry args={[40, 0.015]} />
          <meshBasicMaterial color="#0d1a0d" />
        </mesh>
      ))}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`fgw${i}`} rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[(i - 10) * 2, -2.49, 0]}>
          <planeGeometry args={[40, 0.015]} />
          <meshBasicMaterial color="#0d1a0d" />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[40, 18, 0.2]} />
        <meshStandardMaterial color="#060606" roughness={1} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-10, 2, 0]}>
        <boxGeometry args={[0.2, 18, 40]} />
        <meshStandardMaterial color="#060606" roughness={1} />
      </mesh>
      <mesh position={[10, 2, 0]}>
        <boxGeometry args={[0.2, 18, 40]} />
        <meshStandardMaterial color="#060606" roughness={1} />
      </mesh>

      {/* Large drafting table */}
      <group position={[-2, -1.5, -4]}>
        {/* Table surface — angled */}
        <mesh rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[5, 0.06, 3]} />
          <meshStandardMaterial color="#0e0e0e" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Blueprint on table */}
        <mesh ref={blueprintRef} rotation={[-0.2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[4.5, 2.8]} />
          <meshStandardMaterial color="#020d18" emissive="#1a4a6a" emissiveIntensity={0.04} roughness={1} />
        </mesh>
        {/* Blueprint grid lines on paper */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`bl${i}`} rotation={[-0.2, 0, 0]} position={[0, 0.06, (i - 4) * 0.35]}>
            <planeGeometry args={[4.4, 0.008]} />
            <meshBasicMaterial color="#1a3a5a" />
          </mesh>
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={`blw${i}`} rotation={[-0.2, 0, Math.PI / 2]} position={[(i - 6) * 0.37, 0.06, 0]}>
            <planeGeometry args={[2.7, 0.008]} />
            <meshBasicMaterial color="#1a3a5a" />
          </mesh>
        ))}
        {/* Table legs */}
        {[[-2.3, -1], [2.3, -1], [-2.3, 1], [2.3, 1]].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, -0.6, lz]}>
            <boxGeometry args={[0.08, 1.2, 0.08]} />
            <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Architect lamp over table */}
      <group position={[1, 1.8, -4]}>
        {/* Arm */}
        <mesh rotation={[0, 0, -0.6]} position={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Lamp head */}
        <mesh ref={lampRef} position={[-0.9, -0.3, 0]} rotation={[0, 0, 0.8]}>
          <coneGeometry args={[0.25, 0.4, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.9, -0.15, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fff8e0" emissive="#fff5cc" emissiveIntensity={2} />
        </mesh>
        <pointLight ref={lightRef} position={[-0.9, -0.4, 0]} intensity={1.5} distance={7} color="#e8d5a0" decay={2} />
      </group>

      {/* Drafting stool */}
      <group position={[-1.5, -2, -2]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 16]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 5) * 0.35, -0.4, Math.sin(i * Math.PI * 2 / 5) * 0.35]}>
            <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} rotation={[0.4, 0, 0]} />
            <meshStandardMaterial color="#222" metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Shelves on left wall with rolled blueprints */}
      {[0, 1, 2].map((row) => (
        <group key={row} position={[-9.7, row * 1.2 - 0.5, -5 - row * 0.5]}>
          <mesh>
            <boxGeometry args={[0.1, 0.06, 2]} />
            <meshStandardMaterial color="#111" roughness={0.7} />
          </mesh>
          {[0, 1, 2, 3].map((col) => (
            <mesh key={col} position={[0.1, 0.15, col * 0.45 - 0.6]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
              <meshStandardMaterial color={['#0a1a2a', '#1a0a0a', '#0a1a0a', '#1a1a0a'][col]} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Large blueprint pinned on back wall */}
      <mesh position={[4, 1.5, -9.8]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#020d18" emissive="#0d2a40" emissiveIntensity={0.06} roughness={1} />
      </mesh>
      {/* Grid on wall blueprint */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`wbl${i}`} position={[4, (i - 5) * 0.28 + 1.5, -9.75]}>
          <planeGeometry args={[3.8, 0.008]} />
          <meshBasicMaterial color="#1a3a5a" />
        </mesh>
      ))}
      <pointLight position={[4, 3, -8]} intensity={0.6} distance={5} color="#6090b0" decay={2} />

      {/* Triangle ruler on table */}
      <mesh position={[0.5, -1.42, -3.5]} rotation={[-0.2, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.01, 0.6]} />
        <meshStandardMaterial color="#0a0a14" roughness={0.3} metalness={0.5} transparent opacity={0.8} />
      </mesh>

      {/* Pencil on table */}
      <mesh position={[-0.5, -1.41, -3.2]} rotation={[-0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.9, 6]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.8} />
      </mesh>

      {/* Ceiling industrial light */}
      <group position={[0, 5.8, -5]}>
        <mesh>
          <boxGeometry args={[0.1, 0.06, 2]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={0.3} distance={10} color="#c0c8e0" decay={2} />
      </group>

      <ambientLight intensity={0.012} color="#0808ff" />
    </group>
  )
}

function CameraFloat() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.09) * 0.5
    state.camera.position.y = 0.4 + Math.sin(state.clock.elapsedTime * 0.06) * 0.15
    state.camera.lookAt(0, 0, -5)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#050505', 0.055)
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

export default function Design({ onBack }) {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [tunneling, setTunneling] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/api/characters').then(r => { setCharacters(Array.isArray(r.data) ? r.data : []); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .design-thumb { cursor:pointer; overflow:hidden; position:relative; transition:opacity 0.3s; border:1px solid rgba(100,160,200,0.06); }
        .design-thumb:hover { opacity:0.85; border-color:rgba(100,160,200,0.2); }
        .design-thumb img { width:100%; display:block; filter:grayscale(20%) contrast(1.05); transition:transform 0.6s; }
        .design-thumb:hover img { transform:scale(1.03); }
        .design-label { position:absolute; bottom:0; left:0; right:0; padding:0.5rem 0.75rem; background:linear-gradient(transparent, rgba(0,0,0,0.8)); opacity:0; transition:opacity 0.3s; }
        .design-thumb:hover .design-label { opacity:1; }
        .return-btn { background:transparent; border:1px solid rgba(100,160,200,0.2); color:#6ab0d0; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.6rem 1.2rem; cursor:pointer; transition:all 0.3s; }
        .return-btn:hover { border-color:rgba(100,160,200,0.5); }
        ::-webkit-scrollbar { width:2px; } ::-webkit-scrollbar-track { background:#050505; } ::-webkit-scrollbar-thumb { background:#1a2a3a; }
      `}</style>

      <Canvas camera={{ position: [0, 0.4, 6], fov: 65 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <ArchitectStudio />
        </Suspense>
      </Canvas>

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.88) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', background: 'linear-gradient(to bottom, rgba(5,5,5,0.9), transparent)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'all', animation: 'fadeInUp 0.8s ease forwards' }}>
          <button className="return-btn" onClick={() => setTunneling(true)}>← STATION</button>
        </div>
        <div>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(100,160,200,0.25)', letterSpacing: '0.4em' }}>// PLATFORM 04 — DESIGN</p>
        </div>
      </div>

      {/* Scrollable grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, overflowY: 'auto', paddingTop: '6rem', paddingBottom: '3rem' }}>
        {loaded && items.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.7rem', color: 'rgba(100,160,200,0.1)', letterSpacing: '0.3em' }}>// NO DESIGNS UPLOADED YET</p>
          </div>
        )}
        {items.length > 0 && (
          <div style={{ columns: 3, columnGap: '3px', padding: '0 3rem', animation: 'fadeIn 0.8s ease forwards', animationDelay: '0.3s', opacity: 0 }}>
            {items.map((item) => (
              <div key={item.id} className="design-thumb" style={{ marginBottom: '3px' }} onClick={() => setSelected(item)}>
                <img src={item.image_url} alt={item.title} />
                <div className="design-label">
                  <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', color: 'rgba(100,160,200,0.7)', letterSpacing: '0.2em' }}>{item.title.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.75rem', color: 'rgba(100,160,200,0.07)', letterSpacing: '0.3em' }}>設計室</p>
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.3s ease' }}>
          <img src={selected.image_url} alt={selected.title} style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain' }} />
          <p style={{ position: 'absolute', bottom: '2rem', fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', color: 'rgba(100,160,200,0.3)', letterSpacing: '0.3em' }}>
            {selected.title.toUpperCase()} // CLICK TO CLOSE
          </p>
        </div>
      )}

      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
