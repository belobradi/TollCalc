// --- Constants & Helpers ---
const EARTH_RADIUS_M = 6367e3

function toRad (deg) {
  return (deg * Math.PI) / 180.0
}

// --- Data ---
let STATIONS = []

// --- State ---
let map = null
let navStart = null
let navEnd = null
let navStartMarker = null
let navEndMarker = null
let navRouteLayer = null
let tollStationMarkers = []

// --- UI helpers ---
function makeLabelMarker (point, extraClass) {
  return L.marker([point.lat, point.lon], {
    icon: L.divIcon({
      className: `toll-label ${extraClass || ''}`,
      html: `<span class="toll-dot"></span><span class="toll-text">${point.name ?? 'Ramp'}</span>`,
      iconAnchor: [0, 0]
    })
  })
}
function setAddressField (id, text) {
  const el = document.getElementById(id)
  if (el) el.value = text || ''
}
function updateDistance (t) {
  document.getElementById('distance').textContent = 'Kilometraža: ' + t
}
function updatePrice (t) {
  document.getElementById('price').textContent = 'Okvirna cena: ' + t
}
function showMessage (t) {
  document.getElementById('msg').textContent = t
}

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

async function computeRampCharges (sections) {
  let total = 0
  const items = []

  for (const s of sections) {
    const corridor = s.hwsection
    const price = corridor ? await Matrix.get(corridor, s.enter, s.exit) : 0
    items.push({
      corridor,
      from: s.enter,
      to: s.exit,
      price_rsd: price
    })
    total += price
  }

  return {
    price_rsd: total,
    items
  }
}

function stationPassed (routeCoords, station, tolMeters = 50) {
  return routeCoords.some(([lat, lon]) => haversineMeters([lat, lon], [station.lat, station.lon]) <= tolMeters)
}

function computeRamps (routeCoords) {
  const grouped = new Map()
  for (const st of STATIONS.filter(st => stationPassed(routeCoords, st))) {
    if (grouped.has(st.hwsection) === false) {
      grouped.set(st.hwsection, [])
    }
    grouped.get(st.hwsection).push(st)
  }

  const sections = []
  for (const [hwsection, stationData] of grouped) {
    const first = stationData[0] // first station
    const last = stationData[stationData.length - 1] // last station
    console.log('section:', hwsection, 'enter:', first.name, 'exit:', last.name)
    sections.push({ hwsection, enter: first, exit: last })
  }

  return sections
}

function renderSectionRampsOnMap (sections) {
  if (!sections) return
  for (const section of sections) {
    if (section.enter) {
      tollStationMarkers.push(makeLabelMarker(section.enter, 'enter').addTo(map))
    }
    if (section.exit) {
      tollStationMarkers.push(makeLabelMarker(section.exit, 'exit').addTo(map))
    }
  }
}

async function startEndToRouteData (start, end) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` + `${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`

  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error('OSRM response not OK')

  const data = await res.json()
  if (!data.routes || !data.routes[0]) throw new Error('No route found')

  const route = data.routes[0]
  return [route.distance, route.geometry.coordinates.map(([lng, lat]) => [lat, lng])]
}

function densifyRoute (coords, stepMeters = 100) {
  const result = []

  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i]
    const [lat2, lon2] = coords[i + 1]

    result.push([lat1, lon1])

    const dist = haversineMeters([lat1, lon1], [lat2, lon2])
    const numPoints = Math.floor(dist / stepMeters)

    for (let j = 1; j < numPoints; j++) {
      const t = j / numPoints
      const lat = lat1 + (lat2 - lat1) * t
      const lon = lon1 + (lon2 - lon1) * t
      result.push([lat, lon])
    }
  }

  // add last point
  result.push(coords[coords.length - 1])
  return result
}

// --- Routing logic ---
async function drawRoute (start, end) {
  showMessage('Tražim putanju...')
  try {
    let [distance, coords] = await startEndToRouteData(start, end)
    coords = densifyRoute(coords, 10)

    clearRoute()
    navRouteLayer = L.polyline(coords, { weight: 5 }).addTo(map)
    map.fitBounds(navRouteLayer.getBounds(), { padding: [30, 30] })

    updateDistance((distance / 1000).toFixed(1) + ' km')

    const sections = computeRamps(coords)
    renderSectionRampsOnMap(sections)

    const charges = await computeRampCharges(sections)
    updatePrice((charges.price_rsd ?? 0) + ' RSD')
    console.log('Charged (ramp):', charges.price_rsd)

    document.querySelector('.pills').style.display = 'flex'
    showMessage('')
  } catch (err) {
    console.error(err)
    showMessage('Routing failed (network blocked or OSRM unavailable).')
  }
}

// --- Event handlers ---
async function reverseGeocode ([lat, lon]) {
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

// Pick the best street-ish and place-ish fields and format
function formatAddressParts (addr) {
  if (!addr) return ''

  // street candidates (ordered by “streetiness”)
  const street = addr.road || addr.pedestrian || addr.footway || addr.street || addr.path || addr.cycleway || ''
  const houseNo = addr.house_number ? ` ${addr.house_number}` : ''

  // place (prefer city/town/village; fall back sanely)
  const place =
    addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || addr.city_district || addr.suburb || addr.county || ''

  const postcode = addr.postcode || ''
  const country = addr.country || ''

  // Build only the parts you want, skip empties
  const parts = []
  if (street) parts.push(street + houseNo)
  if (place) parts.push(place)
  if (postcode) parts.push(postcode)
  if (country) parts.push(country)

  return parts.join(', ')
}

// Convenience: reverse + format
async function reverseToShortAddress ([lat, lon]) {
  const data = await reverseGeocode([lat, lon])
  return formatAddressParts(data.address) || data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

async function onMapClick (e) {
  const pos = [e.latlng.lat, e.latlng.lng]

  if (!navStart) {
    navStart = pos
    navStartMarker = L.marker(pos).addTo(map).bindTooltip('Start').openTooltip()
    showMessage('')

    // fill startAddress
    try {
      const shortAddr = await reverseToShortAddress(navStart)
      setAddressField('startAddress', shortAddr)
    } catch {
      setAddressField('startAddress', `${navStart[0].toFixed(5)}, ${navStart[1].toFixed(5)}`)
    }
  } else if (!navEnd) {
    navEnd = pos
    navEndMarker = L.marker(pos).addTo(map).bindTooltip('Destinacija').openTooltip()

    // fill endAddress
    try {
      const shortAddr = await reverseToShortAddress(navEnd)
      setAddressField('endAddress', shortAddr)
    } catch {
      setAddressField('endAddress', `${navEnd[0].toFixed(5)}, ${navEnd[1].toFixed(5)}`)
    }
    await drawRoute(navStart, navEnd)
  } else {
    reset()
  }
}

function reset () {
  navStart = navEnd = null
  ;[navStartMarker, navEndMarker].forEach(m => {
    if (m) map.removeLayer(m)
  })

  navStartMarker = navEndMarker = null

  clearRoute()

  setAddressField('startAddress', '')
  setAddressField('endAddress', '')

  document.querySelector('.pills').style.display = 'none'
  showMessage('')
}

function clearRoute () {
  // remove route line
  if (navRouteLayer) {
    map.removeLayer(navRouteLayer)
    navRouteLayer = null
  }

  // remove toll markers
  if (tollStationMarkers.length === 0) return
  for (const m of tollStationMarkers) {
    if (m) map.removeLayer(m)
  }
  tollStationMarkers = []
}

function clearSide (which) {
  if (which === 'start') {
    navStart = null
    if (navStartMarker) {
      map.removeLayer(navStartMarker)
      navStartMarker = null
    }
  } else {
    navEnd = null
    if (navEndMarker) {
      map.removeLayer(navEndMarker)
      navEndMarker = null
    }
  }

  // If either side is missing, the route is invalid → clear it & UI
  document.querySelector('.pills').style.display = 'none'
  updateDistance('')
  updatePrice('')
  showMessage('')
  clearRoute()
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

  const startEl = document.getElementById('startAddress')
  const endEl = document.getElementById('endAddress')

  const onAddressInput = e => {
    if (e.target.value.trim() === '') {
      clearSide(e.target.id === 'startAddress' ? 'start' : 'end')
    }
  }
  startEl.addEventListener('input', onAddressInput)
  endEl.addEventListener('input', onAddressInput)

  document.getElementById('resetBtn').onclick = reset
  map.on('click', onMapClick)

  // Consistent label (same as reverse geocode)
  const labelFn = item =>
    typeof formatAddressParts === 'function' ? formatAddressParts(item.address) || item.display_name : item.display_name

  AddressSearch.init({
    countrycodes: 'rs',
    bounded: false,
    getViewbox: () => {
      const b = map.getBounds()
      return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',')
    },
    labelFn,

    onStartPick: ({ lat, lon, label }) => {
      if (navStartMarker) {
        map.removeLayer(navStartMarker)
        navStartMarker = null
      }

      navStart = [lat, lon]
      navStartMarker = L.marker(navStart).addTo(map).bindTooltip('Start').openTooltip()
      const s = document.getElementById('startAddress')
      if (s) s.value = label
      if (navEnd) drawRoute(navStart, navEnd)
    },

    onEndPick: ({ lat, lon, label }) => {
      if (navEndMarker) {
        map.removeLayer(navEndMarker)
        navEndMarker = null
      }

      navEnd = [lat, lon]
      navEndMarker = L.marker(navEnd).addTo(map).bindTooltip('Destinacija').openTooltip()
      const e = document.getElementById('endAddress')
      if (e) e.value = label
      if (navStart) drawRoute(navStart, navEnd)
    }
  })
}

// --- Entry point ---
async function enter () {
  try {
    STATIONS = await (await fetch('stations.json')).json()
    await Matrix.initAll()
    init()
  } catch (err) {
    console.error('Failed to load sections/stations:', err)
  }
}

enter()
