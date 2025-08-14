const SECTIONS = [
  {
    corridor: 'A1',
    from: {
      id: 'SUB',
      name: 'Subotica',
      lat: 46.02106890344609,
      lon: 19.733910649991444
    },
    to: {
      id: 'ZED',
      name: 'Žednik',
      lat: 45.934610792647035,
      lon: 19.707585844346294
    },
    price_rsd: 110
  }
]

const R = 6367e3
const toRad = d => (d * Math.PI) / 180

function haversineMeters (p1, p2) {
  const [lat1, lon1] = p1
  const [lat2, lon2] = p2
  const f1 = toRad(lat1)
  const f2 = toRad(lat2)
  const df = toRad(lat2 - lat1)
  const dl = toRad(lon2 - lon1)
  const a =
    Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function sectionTraversedStrict (routeLatLngs, from, to, tolMeters = 30) {
  let nearFrom = false
  for (const [lat, lon] of routeLatLngs) {
    const dFrom = haversineMeters([lat, lon], [from.lat, from.lon])
    const dTo = haversineMeters([lat, lon], [to.lat, to.lon])
    if (!nearFrom && dFrom <= tolMeters) nearFrom = true
    if (nearFrom && dTo <= tolMeters) return true
  }
  return false
}

function computeSectionCharges (routeCoords, sections) {
  const items = []
  for (const s of sections) {
    if (sectionTraversedStrict(routeCoords, s.from, s.to)) {
      items.push({
        corridor: s.corridor,
        from: s.from.name,
        to: s.to.name,
        price_rsd: s.price_rsd
      })
    }
  }
  const total = items.reduce((acc, it) => acc + it.price_rsd, 0)
  return { total, items }
}

function init () {
  const map = L.map('map').setView([44.8, 20.5], 7)
  const tiles = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }
  ).addTo(map)

  tiles.on('tileerror', () => {
    document.getElementById('msg').textContent =
      'Map tiles failed to load. Check internet, VPN/proxy, or any network filters.'
  })

  let start = null,
    end = null,
    routeLayer = null,
    startM = null,
    endM = null

  function reset () {
    start = end = null
    if (routeLayer) {
      map.removeLayer(routeLayer)
      routeLayer = null
    }
    if (startM) {
      map.removeLayer(startM)
      startM = null
    }
    if (endM) {
      map.removeLayer(endM)
      endM = null
    }
    uiDistance('—')
    uiPrice('—')
    msg('')
  }
  document.getElementById('resetBtn').onclick = reset

  function uiDistance (t) {
    document.getElementById('distance').textContent = 'Distance: ' + t
  }
  function uiPrice (t) {
    document.getElementById('price').textContent = 'Estimated price: ' + t
  }
  function msg (t) {
    document.getElementById('msg').textContent = t
  }

  const tollStations = [
    { name: 'Subotica', lat: 46.02106890344609, lon: 19.733910649991444 },
    { name: 'Žednik', lat: 45.93384453147707, lon: 19.71117780120375 }
  ]
  tollStations.forEach(s =>
    L.circleMarker([s.lat, s.lon], { radius: 5 }).addTo(map).bindTooltip(s.name)
  )

  map.on('click', async e => {
    if (!start) {
      start = [e.latlng.lat, e.latlng.lng]
      startM = L.marker(start).addTo(map).bindTooltip('Start').openTooltip()
      msg('')
    } else if (!end) {
      end = [e.latlng.lat, e.latlng.lng]
      endM = L.marker(end).addTo(map).bindTooltip('End').openTooltip()
      await drawRoute(start, end)
    } else {
      reset()
    }
  })

  async function drawRoute (a, b) {
    msg('Routing…')
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error('OSRM response not OK')
      const data = await res.json()
      if (!data.routes || !data.routes[0]) throw new Error('No route found')

      const route = data.routes[0]
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

      if (routeLayer) map.removeLayer(routeLayer)
      routeLayer = L.polyline(coords, { weight: 5 }).addTo(map)
      map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] })

      const km = route.distance / 1000
      uiDistance(km.toFixed(1) + ' km')

      const result = computeSectionCharges(coords, SECTIONS)
      uiPrice(result.total + ' RSD')
      console.log('Charged sections:', result.items)
      msg('')
    } catch (err) {
      console.error(err)
      msg('Routing failed (network blocked or OSRM unavailable).')
    }
  }
}

window.onload = init
