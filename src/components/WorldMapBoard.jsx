import { useState, useEffect } from 'react'
import { pinColor, toLocalPinCoords } from '../world/realms'

function PinPopup({ title, subtitle, image, description, biography, date, type }) {
  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
      width: '220px', background: 'rgba(4,8,16,0.98)', border: '1px solid rgba(64,128,255,0.25)',
      borderRadius: '4px', overflow: 'hidden', zIndex: 50, pointerEvents: 'none',
      boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
    }}>
      {image && <img src={image} alt={title} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block', opacity: 0.85 }} />}
      <div style={{ padding: '0.65rem 0.75rem' }}>
        {type && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.42rem', color: 'rgba(106,159,255,0.5)', letterSpacing: '0.25em', marginBottom: '0.3rem' }}>{type.toUpperCase()}</p>}
        <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.85rem', color: '#e0e8ff', fontWeight: 300, marginBottom: '0.3rem', lineHeight: 1.3 }}>{title}</p>
        {subtitle && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.5rem', color: 'rgba(180,200,230,0.5)', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{subtitle}</p>}
        {description && <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.7rem', color: 'rgba(190,205,230,0.65)', lineHeight: 1.6, marginBottom: '0.4rem' }}>{description}</p>}
        {biography && <p style={{ fontFamily: '"Noto Serif JP",serif', fontSize: '0.65rem', color: 'rgba(160,180,210,0.5)', lineHeight: 1.6, borderTop: '1px solid rgba(64,128,255,0.1)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>{biography}</p>}
        {date && <p style={{ fontFamily: '"Space Mono",monospace', fontSize: '0.42rem', color: 'rgba(106,159,255,0.35)', letterSpacing: '0.15em', marginTop: '0.4rem' }}>{date}</p>}
      </div>
    </div>
  )
}

export default function WorldMapBoard({
  mode = 'full',
  mapSrc,
  realm,
  mapZoom = null,
  events = [],
  locations = [],
  onSelectEvent,
  hoveredPin,
  setHoveredPin,
  showLegend = true,
  emptyHint,
  children,
}) {
  const [mapOk, setMapOk] = useState(false)
  const [hoveredLoc, setHoveredLoc] = useState(null)

  useEffect(() => {
    setMapOk(false)
  }, [mapSrc, mapZoom?.scale, mapZoom?.origin])

  const displayEvents = events
  const displayLocs = mode === 'realm' && realm
    ? locations.filter(loc => {
        const y = Number(loc.y_percent) || 50
        return y >= realm.yMin && y <= realm.yMax
      })
    : locations

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`world-map-frame ${mode === 'realm' ? 'world-map-frame--realm' : ''} ${mapZoom ? 'world-map-frame--zoomed' : ''}`}>
      {!mapOk && (
        <div className="world-map-frame__fallback" style={realm ? { background: `linear-gradient(160deg, ${realm.glow}, rgba(4,8,16,0.95))` } : undefined} />
      )}
      <div
        className="world-map-frame__zoom"
        style={mapZoom ? { transform: `scale(${mapZoom.scale})`, transformOrigin: mapZoom.origin } : { transform: 'none', transformOrigin: 'center center' }}
      >
        <img src={mapSrc} alt="" className="world-map-frame__img" style={{ display: mapOk ? 'block' : 'none' }} onLoad={() => setMapOk(true)} onError={() => setMapOk(false)} />
      </div>
      <div className="world-map-frame__grid" />
      {children}

      {displayLocs.map(loc => {
        const pos = mode === 'realm' && realm ? toLocalPinCoords(loc, realm) : { x: loc.x_percent, y: loc.y_percent }
        const isHovered = hoveredLoc === loc.id
        return (
          <div
            key={`loc-${loc.id}`}
            className="world-pin world-loc-pin"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: isHovered ? 20 : 6 }}
            onMouseEnter={() => setHoveredLoc(loc.id)}
            onMouseLeave={() => setHoveredLoc(null)}
          >
            <div className="world-pin__dot" style={{ background: isHovered ? 'rgba(220,230,255,0.95)' : undefined }} />
            {isHovered && (
              <PinPopup
                title={loc.name}
                subtitle={loc.type}
                image={loc.image_url}
                description={loc.description}
                biography={loc.biography}
                date={formatDate(loc.created_at)}
                type="location"
              />
            )}
          </div>
        )
      })}

      {displayEvents.map((ev, i) => {
        const colors = pinColor(ev)
        const pos = mode === 'realm' && realm ? toLocalPinCoords(ev, realm) : { x: ev.x_percent, y: ev.y_percent }
        const isHovered = hoveredPin === ev.id
        return (
          <div
            key={ev.id}
            className="world-pin"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: isHovered ? 20 : 6 }}
            onMouseEnter={() => setHoveredPin?.(ev.id)}
            onMouseLeave={() => setHoveredPin?.(null)}
          >
            <div className="world-pin__ring" style={{ borderColor: colors.ring, animationDelay: `${i * 0.15}s` }} />
            <div className="world-pin__dot" style={{ background: colors.core }} />
            {isHovered && (
              <PinPopup
                title={ev.headline}
                subtitle={ev.location_name}
                image={ev.image_url}
                description={ev.summary}
                date={formatDate(ev.created_at)}
                type={ev.source_type}
              />
            )}
          </div>
        )
      })}

      <div className="world-map-frame__vignette" />
      {showLegend && (
        <div className="world-legend">
          <span className="world-legend__ai">AI BROADCAST</span>
          <span className="world-legend__manual">CANON</span>
          <span className="world-legend__loc">LOCATIONS</span>
          <span className="world-legend__capital">CAPITALS</span>
        </div>
      )}
      {emptyHint && displayEvents.length === 0 && (
        <div className="world-map-hint"><p>{emptyHint}</p></div>
      )}
    </div>
  )
}