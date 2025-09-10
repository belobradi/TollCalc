// utils.js
import { EARTH_RADIUS_M } from './constants.js'

export function toRad (deg) {
  return (deg * Math.PI) / 180.0
}

export function haversineMeters ([lat1, lon1], [lat2, lon2]) {
  const f1 = toRad(lat1)
  const f2 = toRad(lat2)
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_M * c
}

export function densifyRoute (coords, stepMeters = 100) {
  const result = []
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i]
    const [lat2, lon2] = coords[i + 1]
    result.push([lat1, lon1])

    const dist = haversineMeters([lat1, lon1], [lat2, lon2])
    const numPoints = Math.floor(dist / stepMeters)
    for (let j = 1; j < numPoints; j++) {
      const t = j / numPoints
      result.push([lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t])
    }
  }
  result.push(coords[coords.length - 1])
  return result
}

export async function reverseGeocode ([lat, lon]) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'SerbiaTollDemo/1.0 (contact: stankic.nemanja@gmail.com)'
    }
  })
  if (!res.ok) throw new Error('Reverse geocode failed')
  return res.json()
}

export function formatAddressParts (addr) {
  if (!addr) return ''
  const street = addr.road || addr.pedestrian || addr.footway || addr.street || addr.path || addr.cycleway || ''
  const houseNo = addr.house_number ? ` ${addr.house_number}` : ''
  const place =
    addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || addr.city_district || addr.suburb || addr.county || ''
  const postcode = addr.postcode || ''
  const country = addr.country || ''
  const parts = []
  if (street) parts.push(street + houseNo)
  if (place) parts.push(place)
  if (postcode) parts.push(postcode)
  if (country) parts.push(country)
  return parts.join(', ')
}

export async function reverseToShortAddress ([lat, lon]) {
  const data = await reverseGeocode([lat, lon])
  return formatAddressParts(data.address) || data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}
