import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'

function MapRoom() {
  const tableGlowRef = useRef()

  useFrame((state) => {
    if (tableGlowRef.current) {
      tableGlowRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 0.6) * 0.12
    }
  })

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#040608" roughness={0.95} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#020408" roughness={1} />
      </mesh>

      {/* Walls */}
      {[
        [0, 2, -9, [30, 14, 0.2]],
        [0, 2, 9, [30, 14, 0.2]],
        [-9, 2, 0, [0.2, 14, 30]],
        [9, 2, 0, [0.2, 14, 30]],
      ].map(([x, y, z, size], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#030508" roughness={1} />
        </mesh>
      ))}

      {/* War table / map table */}
      <group position={[0, -1.5, -1]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[6, 0.1, 4]} />
          <meshStandardMaterial color="#0a0c14" roughness={0.4} metalness={0.3} />
        </mesh>
        {[[-2.5, 0], [2.5, 0], [-2.5, -1.8], [2.5, -1.8]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.3, z]}>
            <boxGeometry args={[0.15, 0.8, 0.15]} />
            <meshStandardMaterial color="#080a12" roughness={0.7} />
          </mesh>
        ))}
        {/* Glowing map surface */}
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[5.8, 0.01, 3.8]} />
          <meshStandardMaterial color="#0a1020" emissive="#0a1840" emissiveIntensity={0.8} roughness={0.3} />
        </mesh>
        <pointLight ref={tableGlowRef} position={[0, 1.5, 0]} intensity={0.8} distance={8} color="#2040a0" decay={2} />
      </group>

      {/* Wall-mounted map */}
      <mesh position={[0, 1.5, -8.7]}>
        <boxGeometry args={[12, 7, 0.05]} />
        <meshStandardMaterial color="#080c18" emissive="#050a14" emissiveIntensity={0.5} roughness={0.8} />
      </mesh>

      {/* Ceiling lights — strategic, dim */}
      {[[-3, 5, -3], [3, 5, -3], [0, 5, 2]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <pointLight intensity={0.25} distance={7} color="#a0c0ff" decay={2} />
        </group>
      ))}

      {/* Floating data points around room */}
      {Array.from({ length: 15 }).map((_, i) => (
        <DataPoint key={i} index={i} />
      ))}

      <ambientLight intensity={0.012} color="#102040" />
    </group>
  )
}

function DataPoint({ index }) {
  const ref = useRef()
  const speed = 0.1 + Math.random() * 0.2
  const offset = (index / 15) * Math.PI * 2

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * speed + offset) * 0.08
    }
  })

  return (
    <mesh ref={ref} position={[
      (Math.random() - 0.5) * 14,
      Math.random() * 5 - 1,
      (Math.random() - 0.5) * 14,
    ]}>
      <sphereGeometry args={[0.025, 4, 4]} />
      <meshBasicMaterial color="#4080ff" transparent opacity={0.15} />
    </mesh>
  )
}

function CameraFloat() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.09) * 0.8
    state.camera.position.y = 1 + Math.sin(state.clock.elapsedTime * 0.06) * 0.2
    state.camera.lookAt(0, 0, -3)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#030508', 0.05)
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

const REALM_ZONES = [
  { name: 'THE ASHEN NORTH', desc: 'Cold. Industrial. War-scarred.', y: '18%', color: 'rgba(160,180,220,0.15)' },
  { name: 'THE VERDANT MIDDLE', desc: 'Fertile. Political. Divided.', y: '50%', color: 'rgba(100,160,120,0.1)' },
  { name: 'THE SUNKEN SOUTH', desc: 'Oceanic. Ancient. Unknowable.', y: '78%', color: 'rgba(60,100,180,0.12)' },
]

export default function World({ onBack }) {
  const [events, setEvents] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [tunneling, setTunneling] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [hoveredPin, setHoveredPin] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/world/events'),
      api.get('/api/world/locations'),
    ]).then(([evRes, locRes]) => {
      setEvents(evRes.data || [])
      setLocations(locRes.data || [])
      if (evRes.data?.length > 0) {
        setLastUpdated(new Date(evRes.data[0].created_at))
      }
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030508', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.8);opacity:0} }
        @keyframes scanH { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .return-btn { background:transparent; border:1px solid rgba(64,128,255,0.2); color:#4080ff; font-family:'Space Mono',monospace; font-size:0.6rem; letter-spacing:0.3em; padding:0.6rem 1.2rem; cursor:pointer; transition:all 0.3s; }
        .return-btn:hover { border-color:rgba(64,128,255,0.5); }
        .event-item { padding:0.75rem 1rem; border-left:1px solid rgba(64,128,255,0.1); cursor:pointer; transition:all 0.2s; }
        .event-item:hover { border-left-color:rgba(64,128,255,0.5); background:rgba(64,128,255,0.04); }
        ::-webkit-scrollbar { width:2px; } ::-webkit-scrollbar-track { background:#030508; } ::-webkit-scrollbar-thumb { background:#0a1428; }
      `}</style>

      <Canvas camera={{ position: [0, 1, 7], fov: 65 }} style={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <MapRoom />
        </Suspense>
      </Canvas>

      {/* Scanline */}
      <div style={{ position: 'fixed', width: '100%', height: '1px', background: 'rgba(64,128,255,0.04)', animation: 'scanH 6s linear infinite', pointerEvents: 'none', zIndex: 3 }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, rgba(3,5,8,0.1) 0%, rgba(3,5,8,0.88) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 3rem', background: 'linear-gradient(to bottom, rgba(3,5,8,0.95), transparent)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'all', animation: 'fadeInUp 0.8s ease forwards' }}>
          <button className="return-btn" onClick={() => setTunneling(true)}>← STATION</button>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(64,128,255,0.2)', letterSpacing: '0.4em' }}>// PLATFORM 07 — WORLD</p>
          {lastUpdated && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(64,128,255,0.15)', letterSpacing: '0.2em', marginTop: '0.2rem' }}>
            LAST UPDATED {lastUpdated.toLocaleTimeString()}
          </p>}
        </div>
      </div>

      {/* Main UI — split layout */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 320px', paddingTop: '5rem', paddingBottom: '2rem', gap: '0', pointerEvents: 'none' }}>

        {/* Left — World Map */}
        <div style={{ position: 'relative', padding: '1rem 2rem', pointerEvents: 'all' }}>
          <div style={{ animation: 'fadeInUp 0.8s ease forwards', animationDelay: '0.2s', opacity: 0 }}>
            <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(64,128,255,0.25)', letterSpacing: '0.5em', marginBottom: '0.5rem' }}>// THE LAND OF THREE</p>
            <h1 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: 'clamp(1.5rem,2.5vw,2.2rem)', color: '#c0d0f0', fontWeight: 300, marginBottom: '1.5rem' }}>World Map</h1>
          </div>

          {/* Map container */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 'calc(100vh - 14rem)',
            border: '1px solid rgba(64,128,255,0.1)',
            background: 'rgba(3,5,12,0.6)',
            overflow: 'hidden',
            animation: 'fadeIn 1s ease forwards',
            animationDelay: '0.4s',
            opacity: 0,
          }}>
            {/* Realm zones */}
            {REALM_ZONES.map((zone, i) => (
              <div key={i} style={{
                position: 'absolute', left: 0, right: 0,
                top: i === 0 ? 0 : i === 1 ? '33%' : '66%',
                height: '33%',
                background: zone.color,
                borderBottom: i < 2 ? '1px solid rgba(64,128,255,0.08)' : 'none',
                display: 'flex', alignItems: 'center', paddingLeft: '1rem',
              }}>
                <div>
                  <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(192,210,255,0.2)', letterSpacing: '0.3em' }}>{zone.name}</p>
                  <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.65rem', color: 'rgba(192,210,255,0.12)', marginTop: '0.2rem' }}>{zone.desc}</p>
                </div>
              </div>
            ))}

            {/* Grid lines */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 9}%`, width: '1px', background: 'rgba(64,128,255,0.04)' }} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 11}%`, height: '1px', background: 'rgba(64,128,255,0.04)' }} />
            ))}

            {/* Fictional locations */}
            {locations.map(loc => (
              <div key={loc.id} style={{
                position: 'absolute',
                left: `${loc.x_percent}%`,
                top: `${loc.y_percent}%`,
                transform: 'translate(-50%, -50%)',
              }}>
                <div style={{ width: '8px', height: '8px', background: 'rgba(192,210,255,0.5)', borderRadius: '50%', border: '1px solid rgba(192,210,255,0.3)' }} />
                <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.45rem', color: 'rgba(192,210,255,0.4)', letterSpacing: '0.1em', whiteSpace: 'nowrap', marginTop: '0.2rem', transform: 'translateX(-30%)' }}>{loc.name}</p>
              </div>
            ))}

            {/* AI event pins */}
            {events.map((ev, i) => (
              <div
                key={ev.id}
                style={{
                  position: 'absolute',
                  left: `${ev.x_percent}%`,
                  top: `${ev.y_percent}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: hoveredPin === ev.id ? 10 : 1,
                }}
                onClick={() => setSelectedEvent(ev)}
                onMouseEnter={() => setHoveredPin(ev.id)}
                onMouseLeave={() => setHoveredPin(null)}
              >
                {/* Pulse ring */}
                <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(255,80,80,0.4)', animation: `pulse ${1.5 + i * 0.3}s ease infinite` }} />
                {/* Pin dot */}
                <div style={{ width: '8px', height: '8px', background: 'rgba(255,80,80,0.8)', borderRadius: '50%', border: '1px solid rgba(255,120,120,0.6)' }} />

                {/* Tooltip */}
                {hoveredPin === ev.id && (
                  <div style={{
                    position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(3,5,12,0.95)', border: '1px solid rgba(255,80,80,0.2)',
                    padding: '0.5rem 0.75rem', minWidth: '160px', maxWidth: '220px',
                    pointerEvents: 'none', animation: 'fadeIn 0.2s ease',
                  }}>
                    <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(255,80,80,0.6)', letterSpacing: '0.2em', marginBottom: '0.3rem' }}>{ev.location_name}</p>
                    <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.7rem', color: '#c0d0f0', lineHeight: 1.5 }}>{ev.headline}</p>
                  </div>
                )}
              </div>
            ))}

            {loaded && events.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', color: 'rgba(64,128,255,0.15)', letterSpacing: '0.3em' }}>// AWAITING WORLD DATA</p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Event feed */}
        <div style={{
          borderLeft: '1px solid rgba(64,128,255,0.08)',
          padding: '0 0 0 0',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(3,5,8,0.7)',
          pointerEvents: 'all',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(64,128,255,0.08)' }}>
            <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(64,128,255,0.3)', letterSpacing: '0.3em' }}>// LIVE DISPATCH</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
            {events.map((ev, i) => (
              <div key={ev.id} className="event-item" onClick={() => setSelectedEvent(ev)}
                style={{ animation: 'fadeInUp 0.5s ease forwards', animationDelay: `${0.4 + i * 0.08}s`, opacity: 0 }}>
                <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(255,80,80,0.4)', letterSpacing: '0.2em', marginBottom: '0.3rem' }}>
                  ● {ev.location_name?.toUpperCase()}
                </p>
                <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.8rem', color: 'rgba(192,210,255,0.7)', lineHeight: 1.6, fontWeight: 300 }}>{ev.headline}</p>
              </div>
            ))}

            {loaded && events.length === 0 && (
              <div style={{ padding: '2rem 1.5rem' }}>
                <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(64,128,255,0.1)', letterSpacing: '0.2em', lineHeight: 1.8 }}>// NO EVENTS RECORDED YET{'\n'}// ADMIN CAN TRIGGER A WORLD REFRESH</p>
              </div>
            )}
          </div>

          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(64,128,255,0.08)' }}>
            <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.6rem', color: 'rgba(64,128,255,0.08)', letterSpacing: '0.2em' }}>世界地図</p>
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div onClick={() => setSelectedEvent(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3,5,8,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', animation: 'fadeIn 0.3s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '560px', width: '100%', border: '1px solid rgba(64,128,255,0.15)', background: 'rgba(5,8,16,0.9)', padding: '2.5rem' }}>
            <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(255,80,80,0.5)', letterSpacing: '0.3em', marginBottom: '0.75rem' }}>
              ● ACTIVE EVENT // {selectedEvent.location_name?.toUpperCase()}
            </p>
            <h2 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '1.3rem', color: '#c0d0f0', fontWeight: 300, marginBottom: '1.5rem', lineHeight: 1.5 }}>{selectedEvent.headline}</h2>
            <div style={{ width: '32px', height: '1px', background: 'rgba(64,128,255,0.2)', marginBottom: '1.5rem' }} />
            <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.95rem', color: 'rgba(192,210,255,0.55)', lineHeight: 2, fontWeight: 300 }}>{selectedEvent.summary}</p>
            <button onClick={() => setSelectedEvent(null)} style={{ marginTop: '2rem', background: 'transparent', border: '1px solid rgba(64,128,255,0.15)', color: 'rgba(64,128,255,0.5)', fontFamily: '"Space Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
