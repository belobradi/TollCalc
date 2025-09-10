// routing.js
import { Matrix } from './matrix.js'
import { STATIONS } from './data.js'
import { haversineMeters, densifyRoute } from './utils.js'

export function stationPassed (routeCoords, station, tolMeters = 50) {
  return routeCoords.some(([lat, lon]) => haversineMeters([lat, lon], [station.lat, station.lon]) <= tolMeters)
}

export function computeRamps (routeCoords) {
  const grouped = new Map()
  for (const st of STATIONS.filter(st => stationPassed(routeCoords, st))) {
    if (!grouped.has(st.hwsection)) grouped.set(st.hwsection, [])
    grouped.get(st.hwsection).push(st)
  }
  const sections = []
  for (const [hwsection, stationData] of grouped) {
    const first = stationData[0]
    const last = stationData[stationData.length - 1]
    console.log('section:', hwsection, 'enter:', first.name, 'exit:', last.name)
    sections.push({ hwsection, enter: first, exit: last })
  }
  return sections
}

export async function computeRampCharges (sections) {
  let total = 0
  const items = []
  for (const s of sections) {
    const corridor = s.hwsection
    const price = corridor ? await Matrix.get(corridor, s.enter, s.exit) : 0
    items.push({ corridor, from: s.enter, to: s.exit, price_rsd: price })
    total += price
  }
  return { price_rsd: total, items }
}

export async function startEndToRouteData (start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error('OSRM response not OK')
  const data = await res.json()
  if (!data.routes || !data.routes[0]) throw new Error('No route found')
  const route = data.routes[0]
  return [
    route.distance,
    densifyRoute(
      route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      10
    )
  ]
}
