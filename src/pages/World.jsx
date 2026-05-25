import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import api from '../utils/api'
import { getWorldClock } from '../utils/worldClock'
import { REALMS, WORLD_MAP_SRC, getRealm, realmForEvent } from '../world/realms'
import { getContinent, continentsInRealm } from '../world/geography'
import WorldCommandClock from '../components/WorldCommandClock'
import WorldMapBoard from '../components/WorldMapBoard'
import WorldGlobeButton from '../components/WorldGlobeButton'
import WorldGeographyLayer from '../components/WorldGeographyLayer'

function MapRoom() {
  const tableGlowRef = useRef()
  useFrame((state) => {
    if (tableGlowRef.current) {
      tableGlowRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08
    }
  })
  return (
    <group>
      <ambientLight intensity={0.008} color="#102040" />
      <pointLight ref={tableGlowRef} position={[0, 2, 0]} intensity={0.4} distance={12} color="#2040a0" decay={2} />
    </group>
  )
}

function CameraFloat() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.3
    state.camera.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 0.04) * 0.1
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function FogSetup() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#030508', 0.06)
    return () => { scene.fog = null }
  }, [scene])
  return null
}

function TunnelBack({ active, onComplete }) {
  useEffect(() => {
    if (active) { const t = setTimeout(onComplete, 900); return () => clearTimeout(t) }
  }, [active, onComplete])
  if (!active) return null
  return <div className="world-tunnel" />
}

function EventModal({ event, onClose }) {
  if (!event) return null
  return (
    <div className="world-modal-bg" onClick={onClose}>
      <div className="world-modal" onClick={e => e.stopPropagation()}>
        <p className="world-modal__tag">● {event.location_name?.toUpperCase()} · {event.source_type?.toUpperCase()}</p>
        <h3>{event.headline}</h3>
        <p>{event.summary}</p>
        <button type="button" className="world-modal__close" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  )
}

function DispatchFeed({ eventsByRealm, onSelect }) {
  return (
    <aside className="world-feed">
      <div className="world-feed__head">
        <h2>// LIVE DISPATCH</h2>
      </div>
      <div className="world-feed__scroll">
        {eventsByRealm.map(realm => (
          <div key={realm.id}>
            <p className="world-feed__realm" style={{ color: realm.accent }}>{realm.name}</p>
            {realm.items.length === 0 ? (
              <p className="world-feed__item world-feed__item--quiet">// quiet sector</p>
            ) : realm.items.map(ev => (
              <div
                key={ev.id}
                className={`world-feed__item world-feed__item--${ev.source_type === 'manual' ? 'manual' : 'ai'}`}
                onClick={() => onSelect(ev)}
              >
                <p className="world-feed__loc">● {ev.location_name?.toUpperCase()}</p>
                <p className="world-feed__headline">{ev.headline}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default function World({ onBack }) {
  const [view, setView] = useState('map')
  const [realmId, setRealmId] = useState(null)
  const [territoryId, setTerritoryId] = useState(null)
  const [events, setEvents] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [tunneling, setTunneling] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [hoveredPin, setHoveredPin] = useState(null)
  const [clock, setClock] = useState(() => getWorldClock())
  const [weather, setWeather] = useState(null)
  

  const activeRealm = realmId ? getRealm(realmId) : null
  const activeTerritory = territoryId ? getContinent(territoryId) : null
  const [worldMapSrc, setWorldMapSrc] = useState(WORLD_MAP_SRC)

  useEffect(() => {
    const tick = setInterval(() => setClock(getWorldClock()), 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    api.get('/api/world/status')
      .then(res => { if (res.data?.weather_mood) setWeather(res.data.weather_mood) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/api/world/events'),
      api.get('/api/world/locations'),
      api.get('/api/world/maps'),
    ]).then(([evRes, locRes, mapsRes]) => {
      setEvents(Array.isArray(evRes.data) ? evRes.data : [])
      setLocations(Array.isArray(locRes.data) ? locRes.data : [])
      const mapsArr = mapsRes.data || []
      const worldMap = mapsArr.find(m => m.key === 'world')
      if (worldMap?.image_url) setWorldMapSrc(worldMap.image_url)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const openRealm = (id) => {
    setRealmId(id)
    setTerritoryId(null)
    setView('continent')
    setActiveRealmHover(null)
  }

  const openTerritory = (id) => {
    setTerritoryId(id)
    setRealmId(null)
    setView('territory')
  }

  const openWorldMap = () => {
    setView('map')
    setRealmId(null)
    setTerritoryId(null)
  }

  const backToOverview = () => {
    setView('overview')
    setRealmId(null)
    setTerritoryId(null)
  }

  const eventsByRealm = REALMS.map(r => ({
    ...r,
    items: events.filter(ev => realmForEvent(ev) === r.id),
  }))

  const realmEvents = activeRealm
    ? events.filter(ev => realmForEvent(ev) === activeRealm.id)
    : []

  const territoryEvents = activeTerritory
    ? events.filter(ev => {
        const xs = activeTerritory.provinces.map(p => p.x)
        const ys = activeTerritory.provinces.map(p => p.y)
        const pad = 12
        const x = Number(ev.x_percent) || 0
        const y = Number(ev.y_percent) || 0
        return x >= Math.min(...xs) - pad && x <= Math.max(...xs) + pad
          && y >= Math.min(...ys) - pad && y <= Math.max(...ys) + pad
      })
    : []

  const sidebarFeed = view === 'territory' && activeTerritory
    ? [{
        id: activeTerritory.id,
        name: activeTerritory.name,
        accent: REALMS.find(r => r.id === activeTerritory.realm)?.accent,
        items: territoryEvents,
      }]
    : view === 'continent' && activeRealm
      ? continentsInRealm(activeRealm.id).map(c => ({
          id: c.id,
          name: c.name,
          accent: activeRealm.accent,
          items: events.filter(ev => {
            const xs = c.provinces.map(p => p.x)
            const ys = c.provinces.map(p => p.y)
            const pad = 14
            const x = Number(ev.x_percent) || 0
            const y = Number(ev.y_percent) || 0
            return x >= Math.min(...xs) - pad && x <= Math.max(...xs) + pad
              && y >= Math.min(...ys) - pad && y <= Math.max(...ys) + pad
          }),
        }))
      : eventsByRealm

  const viewTitle = view === 'map'
    ? 'Global World Map'
    : view === 'territory' && activeTerritory
      ? activeTerritory.name
      : view === 'continent' && activeRealm
        ? activeRealm.name
        : 'The Land of Three'

  const viewSubtitle = view === 'map'
    ? '// CLICK A CONTINENT TO SEE CITIES · HOVER FOR NAMES'
    : view === 'territory' && activeTerritory
      ? activeTerritory.epithet
      : view === 'continent' && activeRealm
        ? activeRealm.subtitle
        : '// PLATFORM 07 — STRATEGIC OVERVIEW'

  return (
    <div className="world-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+JP:wght@300;400;600&display=swap');
        .world-page { width:100vw; height:100vh; background:#020408; position:relative; overflow:hidden; font-family:'Space Mono',monospace; }
        .world-bg-canvas { position:absolute; inset:0; opacity:0.35; pointer-events:none; }
        .world-vignette { position:fixed; inset:0; background:radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, rgba(2,4,8,0.75) 55%, rgba(2,4,8,0.95) 100%); pointer-events:none; z-index:2; }
        .world-scan { position:fixed; width:100%; height:2px; background:linear-gradient(90deg,transparent,rgba(64,128,255,0.08),transparent); animation:worldScan 8s linear infinite; pointer-events:none; z-index:3; }
        @keyframes worldScan { 0%{transform:translateY(-10%)} 100%{transform:translateY(110vh)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.6);opacity:0} }
        @keyframes clockTick { 0%,100%{opacity:1} 50%{opacity:0.85} }
        .world-tunnel { position:fixed; inset:0; z-index:200; background:#000; animation:fadeIn 0.9s ease forwards; }

        .world-shell { position:fixed; inset:0; z-index:10; display:grid; grid-template-rows:auto 1fr; padding:1.25rem 1.5rem 1.5rem; gap:1rem; pointer-events:none; }
        .world-topbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; pointer-events:all; animation:fadeInUp 0.6s ease forwards; }
        .world-topbar-left { display:flex; align-items:center; gap:0.75rem; min-width:140px; }
        .world-return { background:transparent; border:1px solid rgba(64,128,255,0.25); color:#6a9fff; font-size:0.65rem; letter-spacing:0.28em; padding:0.65rem 1.25rem; cursor:pointer; transition:border-color 0.25s; white-space:nowrap; }
        .world-return:hover { border-color:rgba(106,159,255,0.6); }
        .world-topbar-title { text-align:center; flex:1; }
        .world-topbar-title h1 { font-family:'Noto Serif JP',serif; font-size:clamp(1rem,2vw,1.55rem); color:#d8e4ff; font-weight:300; letter-spacing:0.06em; }
        .world-topbar-title p { font-size:0.52rem; color:rgba(106,159,255,0.45); letter-spacing:0.35em; margin-top:0.25rem; }
        .world-topbar-right { min-width:140px; display:flex; justify-content:flex-end; }

        .world-globe-btn { display:flex; align-items:center; gap:0.5rem; background:rgba(8,16,32,0.8); border:1px solid rgba(64,128,255,0.25); color:#6a9fff; font-size:0.5rem; letter-spacing:0.2em; padding:0.55rem 0.85rem; cursor:pointer; transition:all 0.25s; }
        .world-globe-btn:hover, .world-globe-btn--active { border-color:rgba(106,159,255,0.55); background:rgba(32,64,120,0.35); color:#9ec0ff; box-shadow:0 0 20px rgba(64,128,255,0.15); }

        .world-main { display:grid; grid-template-columns:1fr min(380px,32vw); gap:1.25rem; min-height:0; pointer-events:none; }
        @media (max-width:900px) { .world-main { grid-template-columns:1fr; grid-template-rows:1fr auto; } }

        .world-map-col { display:flex; flex-direction:column; gap:0.85rem; min-height:0; pointer-events:all; }
        .world-command-clock { background:linear-gradient(135deg,rgba(8,14,28,0.95),rgba(4,8,18,0.98)); border:1px solid rgba(64,128,255,0.2); box-shadow:0 0 40px rgba(32,64,128,0.15), inset 0 1px 0 rgba(255,255,255,0.04); padding:1.1rem 1.35rem; animation:fadeInUp 0.7s ease 0.1s forwards; opacity:0; }
        .world-command-clock__grid { display:grid; grid-template-columns:1.2fr 1.4fr 1fr; gap:1rem; align-items:end; }
        @media (max-width:700px) { .world-command-clock__grid { grid-template-columns:1fr; } }
        .world-command-clock__label { display:block; font-size:0.52rem; letter-spacing:0.35em; color:rgba(106,159,255,0.5); margin-bottom:0.35rem; }
        .world-command-clock__date { font-family:'Noto Serif JP',serif; font-size:clamp(1.1rem,2.2vw,1.55rem); color:#e8f0ff; }
        .world-command-clock__time { font-size:clamp(1.35rem,3vw,2.1rem); color:#7eb8ff; letter-spacing:0.06em; animation:clockTick 2s ease infinite; font-weight:700; }
        .world-command-clock__meta { display:flex; flex-wrap:wrap; gap:0.65rem; align-items:center; font-size:0.85rem; text-transform:capitalize; color:#b8cce8; }
        .world-command-clock__season { padding:0.25rem 0.65rem; border:1px solid rgba(106,159,255,0.25); background:rgba(32,64,120,0.2); }
        .world-command-clock__weather { padding:0.25rem 0.65rem; border:1px solid rgba(106,159,255,0.2); background:rgba(20,40,80,0.35); }

        .world-map-frame { position:relative; flex:1; min-height:280px; border:1px solid rgba(64,128,255,0.15); background:#050a14; overflow:hidden; box-shadow:inset 0 0 80px rgba(0,0,0,0.6); animation:fadeIn 0.8s ease forwards; }
        .world-map-frame--zoomed .world-map-frame__zoom { transition:transform 0.55s ease; }
        .world-map-frame--realm { min-height:340px; border-color:rgba(106,159,255,0.22); }
        .world-map-frame__img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.62; filter:saturate(0.9) contrast(1.08); }
        .world-map-frame--realm .world-map-frame__img { opacity:0.72; }
        .world-map-frame__fallback { position:absolute; inset:0; background:linear-gradient(180deg,#0c1424 0%,#081018 35%,#0a1810 65%,#060c1a 100%); }
        .world-map-frame__grid { position:absolute; inset:0; background-image:linear-gradient(rgba(64,128,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(64,128,255,0.05) 1px,transparent 1px); background-size:8% 11%; pointer-events:none; }
        .world-map-frame__zoom { position:absolute; inset:0; transition:transform 0.6s ease; }
        .world-map-frame__vignette { position:absolute; inset:0; box-shadow:inset 0 0 100px rgba(2,4,8,0.8); pointer-events:none; z-index:4; }

        .world-geo-layer { position:absolute; inset:0; z-index:7; pointer-events:none; }
        .world-geo-continent { position:absolute; transform:translate(-50%,-50%); pointer-events:all; background:rgba(4,8,18,0.82); border:1px solid; padding:0.4rem 0.65rem; cursor:pointer; text-align:left; max-width:140px; transition:transform 0.2s, box-shadow 0.2s; }
        .world-geo-continent:hover { transform:translate(-50%,-50%) scale(1.06); box-shadow:0 0 24px rgba(64,128,255,0.2); z-index:12; }
        .world-geo-continent__name { display:block; font-size:0.55rem; letter-spacing:0.2em; font-weight:700; }
        .world-geo-continent__epithet { display:block; font-family:'Noto Serif JP',serif; font-size:0.55rem; opacity:0.55; margin-top:0.15rem; line-height:1.3; }
        .world-geo-capital { position:absolute; transform:translate(-50%,-50%); z-index:8; pointer-events:all; }
        .world-geo-capital__dot { display:block; width:7px; height:7px; margin:0 auto; border-radius:1px; transform:rotate(45deg); background:rgba(220,230,255,0.9); border:1px solid; box-shadow:0 0 8px rgba(180,210,255,0.4); }
        .world-geo-capital__label { position:absolute; left:50%; bottom:calc(100% + 6px); transform:translateX(-50%); background:rgba(4,8,16,0.94); border:1px solid rgba(64,128,255,0.2); padding:0.25rem 0.45rem; white-space:nowrap; pointer-events:none; z-index:15; }
        .world-geo-capital--hover .world-geo-capital__dot { transform:rotate(45deg) scale(1.25); }
        .world-geo-capital__city { display:block; font-size:0.48rem; letter-spacing:0.12em; color:#e0e8ff; }
        .world-geo-capital__prov { display:block; font-family:'Noto Serif JP',serif; font-size:0.45rem; color:rgba(180,200,230,0.45); margin-top:0.1rem; }

        .world-continents { position:absolute; inset:0; display:grid; grid-template-rows:repeat(3,1fr); }
        .world-continent { position:relative; border-bottom:1px solid rgba(255,255,255,0.06); transition:all 0.3s; cursor:pointer; }
        .world-continent:last-child { border-bottom:none; }
        .world-continent:hover, .world-continent--active { background:rgba(255,255,255,0.04); box-shadow:inset 0 0 50px var(--glow); }
        .world-continent__label { position:absolute; left:1rem; top:0.75rem; z-index:4; pointer-events:none; }
        .world-continent__name { font-size:clamp(0.55rem,1.1vw,0.75rem); letter-spacing:0.28em; font-weight:700; }
        .world-continent__sub { font-family:'Noto Serif JP',serif; font-size:0.72rem; opacity:0.6; margin-top:0.25rem; }
        .world-continent__badge { position:absolute; right:1rem; top:50%; transform:translateY(-50%); font-size:0.5rem; letter-spacing:0.2em; padding:0.35rem 0.65rem; border:1px solid; z-index:4; pointer-events:none; }
        .world-continent__enter { position:absolute; right:1rem; bottom:0.65rem; font-size:0.45rem; letter-spacing:0.25em; color:rgba(106,159,255,0.45); z-index:4; pointer-events:none; }

        .world-pin { position:absolute; transform:translate(-50%,-50%); cursor:pointer; z-index:6; }
        .world-pin__ring { position:absolute; inset:-7px; border-radius:50%; border:1px solid; animation:pulse 2s ease infinite; }
        .world-pin__dot { width:11px; height:11px; border-radius:50%; border:1px solid rgba(255,255,255,0.35); position:relative; }
        .world-map-frame--realm .world-pin__dot { width:13px; height:13px; }
        .world-pin__tip { position:absolute; bottom:calc(100% + 10px); left:50%; transform:translateX(-50%); min-width:150px; max-width:220px; padding:0.5rem 0.7rem; background:rgba(4,8,16,0.96); border:1px solid rgba(255,100,80,0.3); font-size:0.58rem; color:#c8d8f0; font-family:'Noto Serif JP',serif; white-space:normal; line-height:1.4; z-index:20; }
        .world-loc-pin .world-pin__dot { width:8px; height:8px; background:rgba(200,210,255,0.45); }

        .world-legend { position:absolute; bottom:0.75rem; left:1rem; display:flex; gap:1rem; flex-wrap:wrap; font-size:0.48rem; letter-spacing:0.15em; color:rgba(180,200,230,0.45); z-index:5; }
        .world-legend span::before { content:''; display:inline-block; width:6px; height:6px; border-radius:50%; margin-right:0.35rem; vertical-align:middle; }
        .world-legend__ai::before { background:#ff6b5a; }
        .world-legend__manual::before { background:#44ff88; }
        .world-legend__loc::before { background:#aabbcc; }
        .world-legend__capital::before { background:#d4e0ff; transform:rotate(45deg); border-radius:1px; }
        .world-map-hint { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:3; pointer-events:none; }
        .world-map-hint p { font-size:0.6rem; letter-spacing:0.3em; color:rgba(106,159,255,0.25); }

        .world-feed { display:flex; flex-direction:column; min-height:0; background:rgba(4,8,16,0.88); border:1px solid rgba(64,128,255,0.12); pointer-events:all; animation:fadeInUp 0.8s ease 0.15s forwards; opacity:0; }
        .world-feed__head { padding:1rem 1.15rem; border-bottom:1px solid rgba(64,128,255,0.1); }
        .world-feed__head h2 { font-size:0.58rem; letter-spacing:0.35em; color:rgba(106,159,255,0.55); }
        .world-feed__scroll { flex:1; overflow-y:auto; padding:0.5rem 0; }
        .world-feed__realm { padding:0.65rem 1rem 0.35rem; font-size:0.5rem; letter-spacing:0.3em; border-top:1px solid rgba(64,128,255,0.06); }
        .world-feed__item { padding:0.65rem 1.15rem; border-left:2px solid transparent; cursor:pointer; transition:all 0.2s; }
        .world-feed__item--quiet { opacity:0.35; cursor:default; }
        .world-feed__item:hover { border-left-color:rgba(106,159,255,0.5); background:rgba(64,128,255,0.05); }
        .world-feed__item--manual { border-left-color:rgba(68,255,136,0.35); }
        .world-feed__item--ai { border-left-color:rgba(255,100,80,0.35); }
        .world-feed__loc { font-size:0.48rem; color:rgba(255,120,100,0.55); letter-spacing:0.15em; margin-bottom:0.25rem; }
        .world-feed__headline { font-family:'Noto Serif JP',serif; font-size:0.78rem; color:rgba(210,220,240,0.8); line-height:1.5; }

        .world-modal-bg { position:fixed; inset:0; z-index:100; background:rgba(2,4,8,0.94); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fadeIn 0.25s ease; pointer-events:all; }
        .world-modal { max-width:520px; width:100%; border:1px solid rgba(64,128,255,0.2); background:rgba(6,10,20,0.98); padding:2rem; }
        .world-modal__tag { font-size:0.5rem; letter-spacing:0.3em; color:rgba(255,120,100,0.55); margin-bottom:0.75rem; }
        .world-modal h3 { font-family:'Noto Serif JP',serif; font-size:1.25rem; color:#dce8ff; font-weight:300; line-height:1.45; margin-bottom:1.25rem; }
        .world-modal p { font-family:'Noto Serif JP',serif; font-size:0.92rem; color:rgba(190,205,230,0.65); line-height:1.85; }
        .world-modal__close { margin-top:1.75rem; background:transparent; border:1px solid rgba(106,159,255,0.25); color:rgba(106,159,255,0.7); font-size:0.58rem; letter-spacing:0.2em; padding:0.5rem 1rem; cursor:pointer; }
      `}</style>

      <Canvas className="world-bg-canvas" camera={{ position: [0, 1, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <FogSetup />
          <CameraFloat />
          <MapRoom />
        </Suspense>
      </Canvas>

      <div className="world-scan" />
      <div className="world-vignette" />

      <div className="world-shell">
        <header className="world-topbar">
          <div className="world-topbar-left">
            <button
              type="button"
              className="world-return"
              onClick={() => {
                if (view === 'map') setTunneling(true)
                else if (view === 'territory') openWorldMap()
                else backToOverview()
              }}
            >
              {view === 'map' ? '← STATION' : view === 'territory' ? '← WORLD MAP' : '← MAP'}
            </button>
          </div>
          <div className="world-topbar-title">
            <p>{viewSubtitle}</p>
            <h1>{viewTitle}</h1>
          </div>
          <div className="world-topbar-right">
            <WorldGlobeButton
              onClick={openWorldMap}
              active={view === 'map'}
            />
          </div>
        </header>

        <div className="world-main">
          <div className="world-map-col">
            <WorldCommandClock clock={clock} weather={weather} />

            

            {(view === 'map' || view === 'continent' || view === 'territory') && (
              <WorldMapBoard
                key={`map-${view}-${realmId || ''}-${territoryId || ''}`}
                mode={view === 'continent' ? 'realm' : 'full'}
                mapSrc={worldMapSrc}
                realm={view === 'continent' ? activeRealm : null}
                mapZoom={view === 'territory' && activeTerritory
                  ? { origin: activeTerritory.mapFocus, scale: 2.5 }
                  : view === 'continent' && activeRealm
                    ? {
                      origin: activeRealm.id === 'north' ? '16% 42%'
                        : activeRealm.id === 'middle' ? '40% 32%'
                          : '74% 42%',
                      scale: 1.75,
                    }
                    : null}
                events={view === 'territory' ? territoryEvents : view === 'continent' ? realmEvents : events}
                locations={locations}
                onSelectEvent={setSelectedEvent}
                hoveredPin={hoveredPin}
                setHoveredPin={setHoveredPin}
                emptyHint={loaded ? '// NO SIGNALS IN THIS SECTOR' : undefined}
              >
                <WorldGeographyLayer
                  scope={view === 'territory' ? 'continent' : view === 'continent' ? 'realm' : 'full'}
                  realmId={activeRealm?.id}
                  continentId={activeTerritory?.id}
                  onContinentClick={openTerritory}
                />
              </WorldMapBoard>
            )}
          </div>

          <DispatchFeed
            eventsByRealm={sidebarFeed}
            onSelect={setSelectedEvent}
          />
        </div>
      </div>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <TunnelBack active={tunneling} onComplete={onBack} />
    </div>
  )
}
