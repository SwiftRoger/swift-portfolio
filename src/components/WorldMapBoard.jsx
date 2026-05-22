import { useState, useEffect } from 'react'
import { pinColor, toLocalPinCoords } from '../world/realms'

/**
 * @param {'full'|'realm'} mode
 * @param {object} realm - required when mode is 'realm'
 */
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

  useEffect(() => {
    setMapOk(false)
  }, [mapSrc, mapZoom?.scale, mapZoom?.origin])

  const displayEvents = mode === 'realm' && realm
    ? events
    : events

  const displayLocs = mode === 'realm' && realm
    ? locations.filter(loc => {
        const y = Number(loc.y_percent) || 50
        return y >= realm.yMin && y <= realm.yMax
      })
    : locations

  return (
    <div className={`world-map-frame ${mode === 'realm' ? 'world-map-frame--realm' : ''} ${mapZoom ? 'world-map-frame--zoomed' : ''}`}>
      {!mapOk && (
        <div
          className="world-map-frame__fallback"
          style={realm ? { background: `linear-gradient(160deg, ${realm.glow}, rgba(4,8,16,0.95))` } : undefined}
        />
      )}
      <div
        className="world-map-frame__zoom"
        style={mapZoom ? {
          transform: `scale(${mapZoom.scale})`,
          transformOrigin: mapZoom.origin,
        } : {
          transform: 'none',
          transformOrigin: 'center center',
        }}
      >
        <img
          src={mapSrc}
          alt=""
          className="world-map-frame__img"
          style={{ display: mapOk ? 'block' : 'none' }}
          onLoad={() => setMapOk(true)}
          onError={() => setMapOk(false)}
        />
      </div>
      <div className="world-map-frame__grid" />
      {children}
      {mode === 'full' && (
        <div className="world-continents world-continents--overlay">
          {/* decorative bands only on full map */}
        </div>
      )}

      {displayLocs.map(loc => {
        const pos = mode === 'realm' && realm
          ? toLocalPinCoords(loc, realm)
          : { x: loc.x_percent, y: loc.y_percent }
        return (
          <div
            key={`loc-${loc.id}`}
            className="world-pin world-loc-pin"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="world-pin__dot" />
          </div>
        )
      })}

      {displayEvents.map((ev, i) => {
        const colors = pinColor(ev)
        const pos = mode === 'realm' && realm
          ? toLocalPinCoords(ev, realm)
          : { x: ev.x_percent, y: ev.y_percent }
        return (
          <div
            key={ev.id}
            className="world-pin"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              zIndex: hoveredPin === ev.id ? 12 : 6,
            }}
            onClick={() => onSelectEvent?.(ev)}
            onMouseEnter={() => setHoveredPin?.(ev.id)}
            onMouseLeave={() => setHoveredPin?.(null)}
          >
            <div className="world-pin__ring" style={{ borderColor: colors.ring, animationDelay: `${i * 0.15}s` }} />
            <div className="world-pin__dot" style={{ background: colors.core }} />
            {hoveredPin === ev.id && (
              <div className="world-pin__tip">{ev.headline}</div>
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
