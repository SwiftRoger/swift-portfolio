/**
 * x/y = percent on world-map.png (0–100).
 * Tuned for the project's equirectangular map (land only, not ocean).
 */

export const CONTINENTS = [
  {
    id: 'valkenheim',
    realm: 'north',
    name: 'Valkenheim',
    epithet: 'Northwest · Frost & Iron',
    center: { x: 15, y: 28 },
    mapFocus: '15% 28%',
    provinces: [
      { name: 'Iron Crown Marches', capital: 'Frostgate', x: 14, y: 24 },
      { name: 'Spinehold Peaks', capital: 'Blackmere', x: 11, y: 31 },
      { name: 'Northern Gate', capital: 'Valken Watch', x: 18, y: 26 },
    ],
  },
  {
    id: 'khardun',
    realm: 'north',
    name: 'Khardün Reach',
    epithet: 'Southwest · Shattered Coast',
    center: { x: 17, y: 60 },
    mapFocus: '17% 60%',
    provinces: [
      { name: 'Greenmarch', capital: 'Harrowden', x: 15, y: 56 },
      { name: 'Sundered Coast', capital: 'Saltgrimm', x: 19, y: 61 },
      { name: 'Shatter Isles', capital: 'Cape Riven', x: 16, y: 65 },
    ],
  },
  {
    id: 'aurelia',
    realm: 'middle',
    name: 'High Aurelia',
    epithet: 'North-Central · White Ring',
    center: { x: 47, y: 17 },
    mapFocus: '47% 17%',
    provinces: [
      { name: 'White Ring Territories', capital: 'Caer Sol', x: 46, y: 13 },
      { name: 'Glacier March', capital: 'Northquiet', x: 43, y: 16 },
      { name: 'Crown Lake District', capital: 'Mirrordeep', x: 50, y: 21 },
    ],
  },
  {
    id: 'sarendor',
    realm: 'middle',
    name: 'Sarendor',
    epithet: 'Central · Desert & Verdance',
    center: { x: 42, y: 50 },
    mapFocus: '42% 50%',
    provinces: [
      { name: 'Western Verdance', capital: 'Lornhaven', x: 29, y: 47 },
      { name: 'Rift Highlands', capital: 'Stoneveil', x: 35, y: 43 },
      { name: 'Spiral Prefecture', capital: 'Coilport', x: 33, y: 45 },
      { name: 'Eastern Ashbelt', capital: 'Sunscar Citadel', x: 53, y: 51 },
    ],
  },
  {
    id: 'meridian',
    realm: 'south',
    name: 'Meridian Spire',
    epithet: 'Northeast · Crater Realm',
    center: { x: 72, y: 22 },
    mapFocus: '72% 22%',
    provinces: [
      { name: 'Crater Dominion', capital: 'Echogate', x: 70, y: 19 },
      { name: 'Eastern Ridge', capital: 'Spirecourt', x: 75, y: 23 },
      { name: 'Quiet Forest March', capital: 'Greenfall', x: 68, y: 27 },
    ],
  },
  {
    id: 'ossuan',
    realm: 'south',
    name: 'Ossuan Depths',
    epithet: 'Southeast · Island Chain',
    center: { x: 76, y: 62 },
    mapFocus: '76% 62%',
    provinces: [
      { name: 'Deepwake Archipelago', capital: 'Brinehollow', x: 74, y: 58 },
      { name: 'Abyssal Shelf', capital: 'Dimreach', x: 77, y: 64 },
      { name: 'Southern Chain', capital: 'Last Buoy', x: 79, y: 69 },
    ],
  },
]

export function getContinent(id) {
  return CONTINENTS.find(c => c.id === id)
}

export function continentsInRealm(realmId) {
  return CONTINENTS.filter(c => c.realm === realmId)
}
