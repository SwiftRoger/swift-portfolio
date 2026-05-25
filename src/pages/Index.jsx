import { useRef, useState, useEffect, Suspense, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

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

const NPC_NAMES = ['Aldric','Mira','Tobias','Seraphine','Gareth','Lysa','Edwin','Nora','Caspian','Wren','Oswin','Tilda','Brennan','Isolde','Rook','Sage','Dunstan','Petra','Cael','Mab']

const NPC_MESSAGES = [
  "Did you see the fog rolling in from the north this morning?",
  "Market prices for grain went up again. Third time this season.",
  "My boots are soaked through. This rain won't let up.",
  "Heard there was a fight down at the docks last night.",
  "The baker ran out of bread before midday. Can you believe it?",
  "Strange lights over the eastern ridge last night.",
  "My cat hasn't come home in three days. I'm worried.",
  "The well by the south gate is tasting strange again.",
  "Caravans from the middle lands are delayed. Again.",
  "Someone left a lantern burning all night outside the chapel.",
  "The blacksmith's apprentice ran off with a merchant's daughter.",
  "Frost on the ground this morning. Unusual for this time of year.",
  "Heard the old tower is haunted again. Third family to leave.",
  "The fishing boats came back half empty today.",
  "My neighbor's dog barks every night at the same hour. Unsettling.",
  "They say the road to Frostgate is washed out.",
  "A stranger passed through yesterday. Wouldn't say where from.",
  "The harvest festival is coming early this year.",
  "Someone stole three chickens from the farm on the hill.",
  "The healer says she's running low on herbs. Bad sign.",
  "Wind's picking up from the west. Storm coming.",
  "Saw a raven sitting on the chapel roof for an hour.",
  "The old bridge creaks something awful these days.",
  "Two guards were reassigned to the northern post overnight.",
  "Rumor has it the lord is expecting visitors from the capital.",
  "The inn was full last night. Haven't seen that in months.",
  "Someone found old coins near the ruins. Could be anything.",
  "The river's running higher than usual for this season.",
  "My knee's been aching. Rain's definitely coming.",
  "Three ships in the harbor today. All flying unfamiliar colors.",
  "The chandler raised his prices again. Everything's getting dear.",
  "Saw smoke from the direction of Saltgrimm. Hope it's nothing.",
  "The children found something in the woods. Won't say what.",
  "A traveling performer set up in the square this morning.",
  "The old woman on the hill hasn't been seen in a week.",
  "Trade routes from the south have been quiet lately.",
  "My roof is leaking again. Third patch this year.",
  "The garrison doubled the night watch last week.",
  "Found a dead crow outside my door this morning.",
  "The priest says prayers for travelers have doubled.",
  "Something's wrong with the horses at the stable. They're restless.",
  "Heard a horn in the distance last night. Far off.",
  "The apothecary is out of fever remedy. Worrying time of year.",
  "Two merchants argued in the square for half the morning.",
  "The road crews haven't been seen in weeks.",
  "My fire keeps going out. The wood is damp.",
  "Soldiers passed through without stopping. Moving fast.",
  "The cobbler says leather is getting scarce.",
  "Odd smell near the eastern gate. Can't place it.",
  "The stars were strange last night. Couldn't sleep.",
  "Someone painted a symbol on the granary door overnight.",
  "The miller's been grinding late into the night lately.",
  "A child claims to have seen something in the fog.",
  "The dye shortage is making the weavers furious.",
  "Three travelers arrived at dusk and left before dawn.",
  "The guard captain looks worried. Won't say why.",
  "My garden hasn't grown right since the late frost.",
  "The water tastes of iron today. Just me?",
  "Heard wolves closer to town last night than usual.",
  "The tanner says hides are coming in thin this season.",
  "Something moved the boundary stones on the east field.",
  "The church bell rang at an odd hour last night.",
  "An old map was found in the demolished warehouse wall.",
  "The herbalist refuses to go near the forest anymore.",
  "There's a new face at the tavern every night this week.",
  "The smithy worked through the night. Something urgent.",
  "Found tracks in the mud I couldn't identify.",
  "The merchant from Mirrordeep hasn't come back yet.",
  "Three days of clear sky. Almost suspicious.",
  "The quarry workers stopped showing up for their shifts.",
  "Heard singing from the empty house on the corner.",
  "The old oath stone by the crossroads has been moved.",
  "My sister says the same dream three nights running.",
  "The road patrols have been extended to the outer farms.",
  "Someone left flowers at the old memorial again.",
  "The tide came in wrong yesterday. Ask any fisherman.",
  "The cartwright finished a big order. For whom, he won't say.",
  "Fog's been thick for four days straight now.",
  "The young ones are restless. Feel it in the air.",
  "A letter arrived at the chapel addressed to no one living.",
  "The price of salt has doubled since last month.",
  "Two farmhands quit without giving reason.",
  "The old watch post on the hill has a light in it again.",
  "Heard horses in the night but saw nothing in the morning.",
  "The crop rotation failed on the west fields. Worrying.",
  "Someone's been asking questions about the old families.",
  "The traveling tinker left without finishing his rounds.",
  "A fire broke out near the warehouse district. Contained quickly.",
  "The courier service has been unreliable lately.",
  "Ice on the puddles this morning despite the season.",
  "The constable looked grave at morning roll call.",
  "They say the old road south is passable again.",
  "A dog has been howling near the cemetery for three nights.",
  "The rope-maker ran out of stock. Unusual.",
  "Noticed fewer birds this week. Quiet skies.",
  "The miller found a broken lock on the store room.",
  "New faces at the morning market. Watching more than buying.",
  "The lanterns on the main road keep going out.",
  "Heard thunder to the north but the sky was clear.",
  "The porter at the gate has been asking extra questions.",
  "Something heavy was moved through town before dawn.",
]

function NPCChat() {
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)

  const addMessage = useCallback(() => {
    const name = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)]
    const text = NPC_MESSAGES[Math.floor(Math.random() * NPC_MESSAGES.length)]
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    setMessages(prev => [...prev.slice(-60), { id: Date.now(), name, text, time }])
  }, [])

  useEffect(() => {
    // Seed with initial messages
    for (let i = 0; i < 8; i++) {
      setTimeout(() => addMessage(), i * 200)
    }
    // Add new message every 4-8 seconds
    const interval = setInterval(() => addMessage(), 4000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [addMessage])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(4,4,12,0.85)', border: '1px solid rgba(192,176,255,0.08)' }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(192,176,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#44ff88', animation: 'pulse 2s ease infinite' }} />
        <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(192,176,255,0.4)', letterSpacing: '0.25em' }}>// NPC CHATTER · LIVE</p>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ padding: '0.35rem 0.85rem', animation: 'fadeInUp 0.3s ease' }}>
            <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.48rem', color: 'rgba(192,176,255,0.25)', marginRight: '0.4rem' }}>{msg.time}</span>
            <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.52rem', color: 'rgba(192,176,255,0.6)', marginRight: '0.4rem' }}>{msg.name}:</span>
            <span style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.72rem', color: 'rgba(220,215,235,0.7)' }}>{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UserChat({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    api.get('/api/world/chat').then(r => setMessages(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handlePost = async () => {
    if (!input.trim()) return
    setPosting(true); setError('')
    try {
      const res = await api.post('/api/world/chat', { message: input.trim() })
      setMessages(prev => [...prev, res.data])
      setInput('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post')
    } finally { setPosting(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(4,4,12,0.85)', border: '1px solid rgba(192,176,255,0.08)' }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(192,176,255,0.08)' }}>
        <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(192,176,255,0.4)', letterSpacing: '0.25em' }}>// TRAVELLER LOG</p>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {messages.length === 0 && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(192,176,255,0.15)', letterSpacing: '0.15em', padding: '1rem', textAlign: 'center' }}>// No messages yet. Be the first.</p>}
        {messages.map(msg => (
          <div key={msg.id} style={{ padding: '0.4rem 0.85rem', borderLeft: `2px solid ${msg.user_id === user?.id ? 'rgba(192,176,255,0.4)' : 'rgba(192,176,255,0.1)'}`, marginBottom: '0.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.15rem' }}>
              <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.52rem', color: msg.user_id === user?.id ? 'rgba(192,176,255,0.8)' : 'rgba(192,176,255,0.45)' }}>{msg.username}</span>
              <span style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.42rem', color: 'rgba(192,176,255,0.2)' }}>{new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.72rem', color: 'rgba(220,215,235,0.7)', lineHeight: 1.5 }}>{msg.message}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(192,176,255,0.08)' }}>
        {!user && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.48rem', color: 'rgba(192,176,255,0.25)', letterSpacing: '0.15em', textAlign: 'center' }}>// Sign in to leave a message</p>}
        {user && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value.slice(0, 100))}
                onKeyDown={e => e.key === 'Enter' && handlePost()}
                placeholder="Leave a message..."
                style={{ flex: 1, background: 'rgba(192,176,255,0.04)', border: '1px solid rgba(192,176,255,0.1)', color: '#e8e0f0', fontFamily: '"Space Mono",monospace', fontSize: '0.65rem', padding: '0.4rem 0.6rem', outline: 'none' }}
              />
              <button onClick={handlePost} disabled={posting || !input.trim()} style={{ background: 'transparent', border: '1px solid rgba(192,176,255,0.2)', color: 'rgba(192,176,255,0.6)', fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', padding: '0.4rem 0.6rem', cursor: 'pointer' }}>
                {posting ? '...' : 'POST'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.42rem', color: error ? '#ff6b6b' : 'rgba(192,176,255,0.2)' }}>{error || '// once per day'}</p>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.42rem', color: 'rgba(192,176,255,0.2)' }}>{input.length}/100</p>
            </div>
          </>
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
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    api.get('/api/characters').then(r => { setCharacters(Array.isArray(r.data) ? r.data : []); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  const filtered = characters.filter(c => {
    const matchFilter = filter === 'all' || c.type === filter
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

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
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 280px', paddingTop: '6rem', paddingBottom: '0' }}>
        <div style={{ overflowY: 'auto', padding: '0 2rem 3rem 3rem' }}>

          {/* Title + filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', animation: 'fadeInUp 0.8s ease forwards', animationDelay: '0.2s', opacity: 0 }}>
            <div>
              <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', color: 'rgba(192,176,255,0.25)', letterSpacing: '0.5em', marginBottom: '0.5rem' }}>// THE LAND OF THREE</p>
              <h1 style={{ fontFamily: '"Noto Serif JP",serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: '#e8e0f8', fontWeight: 300 }}>Character Index</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{ background: 'transparent', border: '1px solid rgba(192,176,255,0.1)', color: '#e8e0f0', fontFamily: '"Space Mono",monospace', fontSize: '0.55rem', padding: '0.35rem 0.6rem', outline: 'none', width: '120px', letterSpacing: '0.1em' }}
              />
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

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', height: '100%', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}><NPCChat /></div>
          <div style={{ flex: 1, overflow: 'hidden' }}><UserChat user={user} /></div>
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
