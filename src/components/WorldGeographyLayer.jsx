import { useState } from 'react'
import { CONTINENTS } from '../world/geography'
import { REALMS } from '../world/realms'

export default function WorldGeographyLayer({
  scope = 'full',
  realmId = null,
  continentId = null,
  onContinentClick,
}) {
  const [hoveredCapital, setHoveredCapital] = useState(null)
  const showLabels = scope === 'continent' || scope === 'realm'
  const showCapitalDots = scope !== 'full'

  let list = CONTINENTS
  if (scope === 'realm' && realmId) list = list.filter(c => c.realm === realmId)
  if (scope === 'continent' && continentId) list = list.filter(c => c.id === continentId)

  return (
    <div className="world-geo-layer">
      {list.map(cont => {
        const realm = REALMS.find(r => r.id === cont.realm)
        return (
          <div key={cont.id}>
            <button
              type="button"
              className="world-geo-continent"
              style={{
                left: `${cont.center.x}%`,
                top: `${cont.center.y}%`,
                color: realm?.accent || '#9eb8e8',
                borderColor: realm?.border || 'rgba(140,180,255,0.4)',
              }}
              onClick={(e) => {
                e.stopPropagation()
                onContinentClick?.(cont.id)
              }}
              title={`${cont.name} — click to zoom`}
            >
              <span className="world-geo-continent__name">{cont.name}</span>
              {scope === 'full' && (
                <span className="world-geo-continent__epithet">{cont.epithet}</span>
              )}
            </button>

            {showCapitalDots && cont.provinces.map(prov => {
              const key = `${cont.id}-${prov.capital}`
              const isHover = hoveredCapital === key
              return (
                <div
                  key={key}
                  className={`world-geo-capital ${isHover ? 'world-geo-capital--hover' : ''}`}
                  style={{ left: `${prov.x}%`, top: `${prov.y}%` }}
                  onMouseEnter={() => setHoveredCapital(key)}
                  onMouseLeave={() => setHoveredCapital(null)}
                  title={`${prov.capital} — ${prov.name}`}
                >
                  <span className="world-geo-capital__dot" style={{ borderColor: realm?.accent }} />
                  {(showLabels || isHover) && (
                    <div className="world-geo-capital__label">
                      <span className="world-geo-capital__city">{prov.capital}</span>
                      <span className="world-geo-capital__prov">{prov.name}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
