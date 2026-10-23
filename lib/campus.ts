export type LatLng = { lat: number; lng: number }

export type Building = {
  name: string
  code: string
  type: string
  position: LatLng
  /** true until someone confirms the pin against the satellite view */
  approximate?: boolean
}

/** Map opens here: roughly the middle of the 40 Acres. */
export const CAMPUS_CENTER: LatLng = { lat: 30.2849, lng: -97.7360 }

/**
 * Building pins.
 * PCL comes from its Wikipedia listing. The others are approximate:
 * right-click the building in Google Maps, click the coordinates to copy
 * them, paste them here, then delete `approximate`.
 */
export const buildings: Building[] = [
  { name: 'PCL Library', code: 'PCL', type: 'Library', position: { lat: 30.28281, lng: -97.73730 } },
  { name: 'Engineering Education', code: 'EER', type: 'Classrooms', position: { lat: 30.2881, lng: -97.7354 }, approximate: true },
  { name: 'Student Activity Center', code: 'SAC', type: 'Student life', position: { lat: 30.2849, lng: -97.7360 }, approximate: true },
  { name: 'Jester West', code: 'JES', type: 'Residence hall', position: { lat: 30.2826, lng: -97.7366 }, approximate: true },
]

export type FloorPlan = {
  id: string
  buildingCode: string
  floor: string
  /** image in /public; north must point up */
  url: string
  /** where the middle of the image sits on the map */
  center: LatLng
  /** real-world size of the whole image, in meters */
  widthM: number
  heightM: number
}

/**
 * Jester West, floor 1. The image covers 855 × 620 cells at 0.5 ft each
 * (from the sheet's 1" = 50' scale), which is 130.3 m × 94.5 m.
 * The center is a first guess: use the alignment panel to line it up,
 * then paste the values it gives you here.
 */
export const floorPlans: FloorPlan[] = [
  {
    id: 'jes-1',
    buildingCode: 'JES',
    floor: '1',
    url: '/floorplans/jester-west-1.png',
    center: { lat: 30.2826, lng: -97.7366 },
    widthM: 130.3,
    heightM: 94.5,
  },
]

const M_PER_DEG_LAT = 111_320

/** North-aligned lat/lng box for an image of a given size in meters. */
export function boundsFor(center: LatLng, widthM: number, heightM: number) {
  const dLat = heightM / 2 / M_PER_DEG_LAT
  const dLng = widthM / 2 / (M_PER_DEG_LAT * Math.cos((center.lat * Math.PI) / 180))
  return {
    north: center.lat + dLat,
    south: center.lat - dLat,
    east: center.lng + dLng,
    west: center.lng - dLng,
  }
}

/** Move a point by meters east and north. */
export function offset(p: LatLng, eastM: number, northM: number): LatLng {
  return {
    lat: p.lat + northM / M_PER_DEG_LAT,
    lng: p.lng + eastM / (M_PER_DEG_LAT * Math.cos((p.lat * Math.PI) / 180)),
  }
}

/** Straight-line distance in miles (haversine). */
export function milesBetween(a: LatLng, b: LatLng) {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
