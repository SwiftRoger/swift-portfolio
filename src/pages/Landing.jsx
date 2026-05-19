import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Fog, MeshStandardMaterial } from 'three'
import * as THREE from 'three'

const SECTIONS = [
  { id: 'bio', label: 'BIO', sublabel: '// WHO I AM', exit: 1, position: [-6, 0, -8] },
  { id: 'art', label: 'ART', sublabel: '// ILLUSTRATIONS', exit: 2, position: [6, 0, -8] },
  { id: 'videos', label: 'VIDEO', sublabel: '// MOTION', exit: 3, position: [-6, 0, -20] },
  { id: 'design', label: 'DESIGN', sublabel: '// GRAPHICS', exit: 4, position: [6, 0, -20] },
]

function StationGeometry() {
  const floorRef = useRef()
  const ceilingRef = useRef()

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -15]} receiveShadow>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Floor grid lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`fl${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.98, -i * 3]}>
          <planeGeometry args={[30, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`fw${i}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[(i - 5) * 3, -2.98, -30]}>
          <planeGeometry args={[60, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, -15]}>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-12, 1, -15]}>
        <boxGeometry args={[0.3, 10, 60]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[12, 1, -15]}>
        <boxGeometry args={[0.3, 10, 60]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
      </mesh>

      {/* Arch supports along the ceiling */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`arch${i}`} position={[0, 0, -i * 7]}>
          <mesh position={[-10, 3, 0]}>
            <boxGeometry args={[4, 0.3, 0.4]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
          <mesh position={[10, 3, 0]}>
            <boxGeometry args={[4, 0.3, 0.4]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[24, 0.3, 0.4]} />
            <meshStandardMaterial color="#0f0f0f" roughness={0.8} />
          </mesh>
          {/* Vertical pillars */}
          <mesh position={[-11.5, 1, 0]}>
            <boxGeometry args={[0.4, 8, 0.4]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
          <mesh position={[11.5, 1, 0]}>
            <boxGeometry args={[0.4, 8, 0.4]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Platform edge */}
      <mesh position={[0, -2.7, -15]}>
        <boxGeometry args={[24, 0.1, 60]} />
        <meshStandardMaterial color="#151515" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Yellow safety line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.64, -15]}>
        <planeGeometry args={[0.15, 60]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Ceiling strip lights - dim and eerie */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`light${i}`} position={[0, 4.6, -i * 9 - 3]}>
          <mesh>
            <boxGeometry args={[0.15, 0.05, 4]} />
            <meshStandardMaterial color="#ccc" emissive="#aaa" emissiveIntensity={0.3} />
          </mesh>
          <pointLight intensity={0.4} distance={12} color="#e8e8e0" decay={2} />
        </group>
      ))}

      {/* Flickering single lights in distance */}
      <pointLight position={[-8, 2, -35]} intensity={0.2} distance={8} color="#fff" />
      <pointLight position={[8, 2, -42]} intensity={0.15} distance={6} color="#ddd" />
    </group>
  )
}

function ExitTunnel({ section, onClick, hovered, onHover, onUnhover }) {
  const groupRef = useRef()
  const signRef = useRef()
  const [flicker, setFlicker] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        setFlicker(Math.random() * 0.3 + 0.7)
        setTimeout(() => setFlicker(1), 80)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useFrame((state) => {
    if (signRef.current) {
      signRef.current.material.emissiveIntensity = hovered
        ? 0.9 + Math.sin(state.clock.elapsedTime * 4) * 0.1
        : 0.4 * flicker
    }
  })

  const [x, y, z] = section.position

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {/* Tunnel entrance arch */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 5, 0.3]} />
        <meshStandardMaterial color="#080808" roughness={1} />
      </mesh>
      {/* Tunnel hole */}
      <mesh position={[0, 1, 0.1]}>
        <boxGeometry args={[3, 3.5, 0.1]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* Deep tunnel illusion */}
      <mesh position={[0, 1, -3]}>
        <boxGeometry args={[2.8, 3.3, 6]} />
        <meshStandardMaterial color="#020202" side={THREE.BackSide} />
      </mesh>

      {/* Exit sign */}
      <mesh
        ref={signRef}
        position={[0, 3.8, 0.2]}
        onClick={onClick}
        onPointerOver={onHover}
        onPointerOut={onUnhover}
      >
        <boxGeometry args={[3.2, 0.7, 0.08]} />
        <meshStandardMaterial
          color="#111"
          emissive="#e8e8e0"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Exit number */}
      <pointLight
        position={[0, 2, 1]}
        intensity={hovered ? 1.5 : 0.5}
        distance={8}
        color="#ffffff"
      />
    </group>
  )
}

function CameraRig({ target, transitioning, onTransitionEnd }) {
  const { camera } = useThree()
  const progress = useRef(0)
  const startPos = useRef(new THREE.Vector3())
  const startLook = useRef(new THREE.Vector3())

  useEffect(() => {
    if (transitioning) {
      progress.current = 0
      startPos.current.copy(camera.position)
    }
  }, [transitioning])

  useFrame((state, delta) => {
    if (!transitioning) {
      // Gentle idle sway
      camera.position.x += (Math.sin(state.clock.elapsedTime * 0.3) * 0.3 - camera.position.x) * 0.02
      camera.position.y += (Math.sin(state.clock.elapsedTime * 0.2) * 0.1 - camera.position.y) * 0.02
      camera.lookAt(0, 0, -10)
      return
    }

    progress.current = Math.min(progress.current + delta * 0.8, 1)
    const t = easeInCubic(progress.current)

    if (target) {
      camera.position.x += (target[0] - camera.position.x) * t * 0.1
      camera.position.y += (target[1] + 1.6 - camera.position.y) * t * 0.1
      camera.position.z += (target[2] + 2 - camera.position.z) * t * 0.1
      camera.lookAt(target[0], target[1], target[2] - 10)
    }

    if (progress.current >= 1) {
      onTransitionEnd()
    }
  })

  return null
}

function easeInCubic(t) {
  return t * t * t
}

function FogController({ transitioning }) {
  const { scene } = useThree()

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#000000', transitioning ? 0.06 : 0.04)
    return () => { scene.fog = null }
  }, [scene, transitioning])

  return null
}

function GlitchOverlay({ active, label }) {
  if (!active) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeOut 0.8s ease forwards',
      animationDelay: '0.6s',
    }}>
      <div style={{
        fontFamily: '"Space Mono", monospace',
        fontSize: 'clamp(2rem, 8vw, 6rem)',
        color: '#fff',
        letterSpacing: '0.3em',
        animation: 'glitch 0.4s steps(2) infinite',
      }}>
        {label}
      </div>
    </div>
  )
}

export default function Landing({ onEnter }) {
  const [hoveredSection, setHoveredSection] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionTarget, setTransitionTarget] = useState(null)
  const [transitionLabel, setTransitionLabel] = useState('')
  const [showGlitch, setShowGlitch] = useState(false)

  const handleExitClick = (section) => {
    if (transitioning) return
    setTransitionLabel(section.label)
    setTransitionTarget(section.position)
    setTransitioning(true)
    setShowGlitch(true)
    setTimeout(() => {
      if (section.id === 'bio') onEnter?.('bio')
      else if (section.id === 'art') onEnter?.('art')
      else if (section.id === 'videos') onEnter?.('video')
      else if (section.id === 'design') onEnter?.('design')
    }, 1400)
  }

  const handleTransitionEnd = () => {
    // camera reached target
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes glitch {
          0% { transform: translate(0); clip-path: inset(0 0 80% 0); }
          20% { transform: translate(-4px, 2px); clip-path: inset(20% 0 60% 0); }
          40% { transform: translate(4px, -2px); clip-path: inset(40% 0 30% 0); filter: invert(1); }
          60% { transform: translate(-2px, 4px); clip-path: inset(60% 0 10% 0); }
          80% { transform: translate(2px, -4px); clip-path: inset(80% 0 0% 0); filter: none; }
          100% { transform: translate(0); clip-path: inset(0); }
        }

        @keyframes glitchFull {
          0%, 100% { transform: translate(0) skew(0deg); opacity: 1; }
          10% { transform: translate(-3px, 1px) skew(-1deg); opacity: 0.9; }
          20% { transform: translate(3px, -1px) skew(1deg); }
          30% { transform: translate(-1px, 3px); opacity: 0.95; }
          40% { transform: translate(0) skew(0); }
          85% { transform: translate(0); }
          87% { transform: translate(-5px, 0) skew(-2deg); opacity: 0.8; }
          89% { transform: translate(5px, 0) skew(2deg); }
          91% { transform: translate(0); opacity: 1; }
        }

        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.6; }
          97% { opacity: 1; }
          98% { opacity: 0.4; }
          99% { opacity: 0.9; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .exit-label {
          font-family: 'Space Mono', monospace;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          animation: glitchFull 6s infinite;
          text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }
        .exit-label:hover {
          text-shadow: 0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.4);
          letter-spacing: 0.4em;
        }

        .scanline {
          position: fixed;
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.03);
          animation: scanline 4s linear infinite;
          pointer-events: none;
          z-index: 10;
        }

        .vignette {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%);
          pointer-events: none;
          z-index: 5;
        }

        .noise {
          position: fixed;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 6;
        }
      `}</style>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.6, 8], fov: 70 }}
        style={{ position: 'absolute', inset: 0 }}
        shadows
      >
        <ambientLight intensity={0.05} />
        <FogController transitioning={transitioning} />
        <CameraRig
          target={transitionTarget}
          transitioning={transitioning}
          onTransitionEnd={handleTransitionEnd}
        />
        <Suspense fallback={null}>
          <StationGeometry />
          {SECTIONS.map((section) => (
            <ExitTunnel
              key={section.id}
              section={section}
              hovered={hoveredSection === section.id}
              onClick={() => handleExitClick(section)}
              onHover={() => setHoveredSection(section.id)}
              onUnhover={() => setHoveredSection(null)}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Overlay effects */}
      <div className="vignette" />
      <div className="noise" />
      <div className="scanline" />

      {/* HUD UI */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        pointerEvents: 'none',
      }}>
        {/* Header */}
        <div style={{ animation: 'fadeInUp 1.2s ease forwards' }}>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.4em',
            marginBottom: '0.5rem',
          }}>// SWIFT CAULFIELD</p>
          <h1 style={{
            fontFamily: '"Noto Serif JP", serif',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            color: '#fff',
            fontWeight: 300,
            letterSpacing: '0.05em',
            animation: 'flicker 8s infinite',
          }}>地下鉄</h1>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.3em',
            marginTop: '0.25rem',
          }}>UNDERGROUND STATION — 4 EXITS</p>
        </div>

        {/* Exit labels overlay — positioned to match 3D tunnels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          pointerEvents: 'all',
          maxWidth: '600px',
          margin: '0 auto',
          animation: 'fadeInUp 1.5s ease forwards',
          animationDelay: '0.5s',
          opacity: 0,
        }}>
          {SECTIONS.map((section, i) => (
            <div
              key={section.id}
              onClick={() => handleExitClick(section)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              style={{
                border: `1px solid ${hoveredSection === section.id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: hoveredSection === section.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <p style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.3em',
                marginBottom: '0.3rem',
              }}>EXIT 0{section.exit}</p>
              <p className="exit-label" style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                letterSpacing: '0.3em',
                animationDelay: `${i * 1.5}s`,
              }}>{section.label}</p>
              <p style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.2em',
                marginTop: '0.2rem',
              }}>{section.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.3em',
          }}>SELECT AN EXIT TO PROCEED</p>
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.3em',
          }}>2026</p>
        </div>
      </div>

      {/* Glitch transition overlay */}
      <GlitchOverlay active={showGlitch} label={transitionLabel} />
    </div>
  )
}
