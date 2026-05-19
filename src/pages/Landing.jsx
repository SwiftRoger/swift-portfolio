import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function Landing({ onEnter }) {
  const mountRef = useRef(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.035)

    // Camera
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 200)
    camera.position.set(0, 1.6, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000)
    mount.appendChild(renderer.domElement)

    // ── FLOOR ──
    const floorGeo = new THREE.PlaneGeometry(20, 200)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111118,
      roughness: 0.9,
      metalness: 0.1,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.z = -50
    scene.add(floor)

    // ── CEILING ──
    const ceilGeo = new THREE.PlaneGeometry(20, 200)
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x080808 })
    const ceil = new THREE.Mesh(ceilGeo, ceilMat)
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = 6
    ceil.position.z = -50
    scene.add(ceil)

    // ── WALLS ──
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0d0d14, roughness: 1 })
    const wallGeo = new THREE.PlaneGeometry(200, 8)

    const wallL = new THREE.Mesh(wallGeo, wallMat)
    wallL.rotation.y = Math.PI / 2
    wallL.position.set(-10, 3, -50)
    scene.add(wallL)

    const wallR = new THREE.Mesh(wallGeo, wallMat)
    wallR.rotation.y = -Math.PI / 2
    wallR.position.set(10, 3, -50)
    scene.add(wallR)

    // ── TRAIN TRACKS ──
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x333340, metalness: 0.8, roughness: 0.3 })

    const railGeo = new THREE.BoxGeometry(0.1, 0.05, 200)
    const railL = new THREE.Mesh(railGeo, trackMat)
    railL.position.set(-0.8, 0, -50)
    scene.add(railL)

    const railR = new THREE.Mesh(railGeo, trackMat)
    railR.position.set(0.8, 0, -50)
    scene.add(railR)

    // Sleepers
    for (let i = 0; i < 80; i++) {
      const sleeperGeo = new THREE.BoxGeometry(2.2, 0.08, 0.15)
      const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x1a1a14, roughness: 1 })
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat)
      sleeper.position.set(0, -0.02, -i * 2.5)
      scene.add(sleeper)
    }

    // ── PILLARS ──
    for (let i = 0; i < 20; i++) {
      const pillarGeo = new THREE.BoxGeometry(0.3, 6, 0.3)
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.8 })

      const pillarL = new THREE.Mesh(pillarGeo, pillarMat)
      pillarL.position.set(-8, 3, -i * 8 - 4)
      scene.add(pillarL)

      const pillarR = new THREE.Mesh(pillarGeo, pillarMat)
      pillarR.position.set(8, 3, -i * 8 - 4)
      scene.add(pillarR)
    }

    // ── CEILING LIGHTS ──
    const lights = []
    for (let i = 0; i < 20; i++) {
      const lightGeo = new THREE.BoxGeometry(0.4, 0.05, 0.4)
      const lightMat = new THREE.MeshStandardMaterial({
        color: 0x4fc3f7,
        emissive: 0x4fc3f7,
        emissiveIntensity: 0.8,
      })
      const lightMesh = new THREE.Mesh(lightGeo, lightMat)
      lightMesh.position.set(0, 5.8, -i * 8 - 4)
      scene.add(lightMesh)

      const pointLight = new THREE.PointLight(0x4fc3f7, 0.6, 12)
      pointLight.position.set(0, 5.5, -i * 8 - 4)
      scene.add(pointLight)
      lights.push({ light: pointLight, mat: lightMat, baseZ: -i * 8 - 4 })
    }

    // ── AMBIENT ──
    const ambient = new THREE.AmbientLight(0x111122, 0.5)
    scene.add(ambient)

    const dirLight = new THREE.DirectionalLight(0x4fc3f7, 0.3)
    dirLight.position.set(0, 10, 0)
    scene.add(dirLight)

    // ── PARTICLES (dust/fog) ──
    const particleCount = 800
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18
      positions[i * 3 + 1] = Math.random() * 6
      positions[i * 3 + 2] = -Math.random() * 100
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x4fc3f7,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── ANIMATION ──
    let frame = 0
    const animate = () => {
      frame++
      requestAnimationFrame(animate)

      // Slow camera drift forward
      camera.position.z = Math.sin(frame * 0.002) * 0.5 - 2
      camera.position.x = Math.sin(frame * 0.001) * 0.1
      camera.rotation.y = Math.sin(frame * 0.001) * 0.02

      // Flicker lights
      lights.forEach((l, i) => {
        if (Math.random() > 0.998) {
          l.light.intensity = Math.random() * 0.3
          l.mat.emissiveIntensity = Math.random() * 0.3
          setTimeout(() => {
            l.light.intensity = 0.6
            l.mat.emissiveIntensity = 0.8
          }, 80)
        }
      })

      // Drift particles
      const pos = particleGeo.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 2] += 0.02
        if (pos[i * 3 + 2] > 2) pos[i * 3 + 2] = -100
      }
      particleGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const handleResize = () => {
      const W = mount.clientWidth
      const H = mount.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div style={styles.container}>
      {/* 3D Scene */}
      <div ref={mountRef} style={styles.canvas} />

      {/* Overlay content */}
      <div style={styles.overlay}>
        <p style={styles.station}>// STATION 01 — PORTFOLIO</p>
        <h1 style={styles.name}>SWIFT CAULFIELD</h1>
        <p style={styles.role}>Artist / Illustrator</p>
        <div style={styles.line} />
        <button
          style={styles.enterBtn}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#4fc3f7'
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#4fc3f7'
          }}
          onClick={onEnter}
        >
          ENTER THE STATION →
        </button>
      </div>

      {/* Bottom mist */}
      <div style={styles.mist} />
    </div>
  )
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#000',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    textAlign: 'center',
    padding: '2rem',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
  },
  station: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: '#4fc3f7',
    letterSpacing: '0.4em',
    opacity: 0.8,
    marginBottom: '1rem',
  },
  name: {
    fontFamily: 'var(--font-title)',
    fontSize: 'clamp(2.5rem, 8vw, 7rem)',
    color: '#e8e8e0',
    letterSpacing: '0.15em',
    textShadow: '0 0 60px rgba(79,195,247,0.3), 0 0 120px rgba(79,195,247,0.1)',
    marginBottom: '0.5rem',
  },
  role: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1rem',
    color: '#4fc3f7',
    letterSpacing: '0.4em',
    opacity: 0.9,
  },
  line: {
    width: '100px',
    height: '1px',
    background: 'linear-gradient(to right, transparent, #4fc3f7, transparent)',
    margin: '2rem auto',
  },
  enterBtn: {
    background: 'transparent',
    border: '1px solid #4fc3f7',
    color: '#4fc3f7',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    letterSpacing: '0.3em',
    padding: '1rem 2.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  mist: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    pointerEvents: 'none',
    zIndex: 5,
  },
}