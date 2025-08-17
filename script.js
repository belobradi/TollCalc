// --- Constants & Helpers ---
const EARTH_RADIUS_M = 6367e3

function toRad (deg) {
  return (deg * Math.PI) / 180.0
}

// --- Data ---
let SECTIONS = []
let STATIONS = []

// --- State ---
let start = null
let end = null
let startMarker = null
let endMarker = null
let entryMarker = null
let exitMarker = null
let routeLayer = null
let map = null

// --- Utility: Distance (Haversine formula) ---
function haversineMeters (p1, p2) {
  const [lat1, lon1] = p1
  const [lat2, lon2] = p2

  const f1 = toRad(lat1)
  const f2 = toRad(lat2)
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_M * c
}

// --- Utility: Station marker with label ---
function makeLabelMarker (point, extraClass) {
  return L.marker([point.lat, point.lon], {
    icon: L.divIcon({
      className: `toll-label ${extraClass || ''}`,
      html: `<span class="toll-dot"></span><span class="toll-text">${point.name ?? 'Ramp'}</span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    })
  })
}

// --- Section logic ---
function sectionTraversed (routeCoords, p1, p2, tolMeters = 40) {
  let seen1 = false,
    seen2 = false
  for (const [lat, lon] of routeCoords) {
    if (!seen1 && haversineMeters([lat, lon], [p1.lat, p1.lon]) <= tolMeters) {
      seen1 = true
    }
    if (!seen2 && haversineMeters([lat, lon], [p2.lat, p2.lon]) <= tolMeters) {
      seen2 = true
    }
  }
  return seen1 && seen2
}

function computeSectionCharges (routeCoords) {
  const items = []

  for (const s of SECTIONS) {
    if (sectionTraversed(routeCoords, s.p1, s.p2)) {
      items.push({
        corridor: s.corridor,
        from: s.p1.name,
        to: s.p2.name,
        price_rsd: s.price_rsd
      })
    }
  }

  const total = items.reduce((sum, it) => sum + it.price_rsd, 0)
  return { total, items }
}

// --- Station logic ---
function stationPassed (routeCoords, station, tolMeters = 30) {
  return routeCoords.some(([lat, lon]) => haversineMeters([lat, lon], [station.lat, station.lon]) <= tolMeters)
}

function computeRamps (routeCoords) {
  const passed = STATIONS.filter(st => stationPassed(routeCoords, st))
  return {
    start: passed[0],
    end: passed[passed.length - 1]
  }
}

function renderRampsOnMap (ramps) {
  if (!ramps) return

  if (ramps.start) {
    entryMarker = makeLabelMarker(ramps.start, 'start').addTo(map)
  }
  if (ramps.end) {
    exitMarker = makeLabelMarker(ramps.end, 'end').addTo(map)
  }
}

async function startEndToRouteData (start, end) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` + `${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`

  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error('OSRM response not OK')

  let data = await res.json()
  if (!data.routes || !data.routes[0]) throw new Error('No route found')

  const route = data.routes[0]
  return [route.distance, route.geometry.coordinates.map(([lng, lat]) => [lat, lng])]
}

// --- Routing logic ---
async function drawRoute (a, b) {
  showMessage('Routing…')
  try {
    let [distance, coords] = await startEndToRouteData(a, b)

    if (routeLayer) map.removeLayer(routeLayer)
    routeLayer = L.polyline(coords, { weight: 5 }).addTo(map)
    map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] })

    // UI updates
    updateDistance((distance / 1000).toFixed(1) + ' km')

    const charges = computeSectionCharges(coords)
    updatePrice(charges.total + ' RSD')
    console.log('Charged sections:', charges.items)

    renderRampsOnMap(computeRamps(coords))
    showMessage('')
  } catch (err) {
    console.error(err)
    showMessage('Routing failed (network blocked or OSRM unavailable).')
  }
}

// --- Event handlers ---
async function onMapClick (e) {
  const pos = [e.latlng.lat, e.latlng.lng]

  if (!start) {
    start = pos
    startMarker = L.marker(pos).addTo(map).bindTooltip('Start').openTooltip()
    showMessage('')
  } else if (!end) {
    end = pos
    endMarker = L.marker(pos).addTo(map).bindTooltip('End').openTooltip()
    await drawRoute(start, end)
  } else {
    reset()
  }
}

function reset () {
  start = end = null
  ;[routeLayer, startMarker, endMarker, entryMarker, exitMarker].forEach(m => {
    if (m) map.removeLayer(m)
  })

  routeLayer = startMarker = endMarker = entryMarker = exitMarker = null

  updateDistance('—')
  updatePrice('—')
  showMessage('')
}

// --- UI helpers ---
function updateDistance (t) {
  document.getElementById('distance').textContent = 'Distance: ' + t
}
function updatePrice (t) {
  document.getElementById('price').textContent = 'Estimated price: ' + t
}
function showMessage (t) {
  document.getElementById('msg').textContent = t
}

// --- Initialization ---
function init () {
  map = L.map('map').setView([44.8, 20.5], 7)

  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  tiles.on('tileerror', () => {
    showMessage('Map tiles failed to load. Check internet or proxy settings.')
  })

  document.getElementById('resetBtn').onclick = reset
  map.on('click', onMapClick)
}

// --- Entry point ---
async function enter () {
  try {
    SECTIONS = await (await fetch('sections.json')).json()
    STATIONS = await (await fetch('stations.json')).json()
    init()
  } catch (err) {
    console.error('Failed to load sections/stations:', err)
  }
}

enter()
