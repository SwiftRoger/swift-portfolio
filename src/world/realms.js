export const REALMS = [
  {
    id: 'north',
    name: 'THE ASHEN NORTH',
    subtitle: 'Cold · Industrial · War-scarred',
    yMin: 0,
    yMax: 35,
    accent: '#8eb4e8',
    glow: 'rgba(120,160,220,0.22)',
    border: 'rgba(140,180,255,0.35)',
    mapImage: import.meta.env.VITE_WORLD_MAP_NORTH_URL || '/world-map-north.png',
  },
  {
    id: 'middle',
    name: 'THE VERDANT MIDDLE',
    subtitle: 'Fertile · Political · Divided',
    yMin: 36,
    yMax: 65,
    accent: '#6ecf9a',
    glow: 'rgba(80,180,120,0.18)',
    border: 'rgba(100,200,140,0.3)',
    mapImage: import.meta.env.VITE_WORLD_MAP_MIDDLE_URL || '/world-map-middle.png',
  },
  {
    id: 'south',
    name: 'THE SUNKEN SOUTH',
    subtitle: 'Oceanic · Ancient · Unknowable',
    yMin: 66,
    yMax: 100,
    accent: '#5a8fd4',
    glow: 'rgba(60,100,200,0.2)',
    border: 'rgba(80,130,220,0.32)',
    mapImage: import.meta.env.VITE_WORLD_MAP_SOUTH_URL || '/world-map-south.png',
  },
]

export const WORLD_MAP_SRC = import.meta.env.VITE_WORLD_MAP_URL || '/world-map.png'

export function getRealm(id) {
  return REALMS.find(r => r.id === id)
}

export function realmForEvent(ev) {
  const y = Number(ev.y_percent) || 50
  if (y <= 35) return 'north'
  if (y <= 65) return 'middle'
  return 'south'
}

export function toLocalPinCoords(ev, realm) {
  const x = Math.min(95, Math.max(5, Number(ev.x_percent) || 50))
  const y = Number(ev.y_percent) || 50
  const span = realm.yMax - realm.yMin || 1
  const localY = ((y - realm.yMin) / span) * 100
  return { x, y: Math.min(95, Math.max(5, localY)) }
}

export function pinColor(ev) {
  if (ev.source_type === 'manual') return { core: '#44ff88', ring: 'rgba(68,255,136,0.5)' }
  if (ev.source_type === 'system') return { core: '#aabbcc', ring: 'rgba(170,187,204,0.4)' }
  return { core: '#ff6b5a', ring: 'rgba(255,100,80,0.55)' }
}

export const WEATHER_ICON = {
  sunny: '☀',
  cloudy: '☁',
  windy: '〰',
  rainy: '☂',
  snowy: '❄',
}
