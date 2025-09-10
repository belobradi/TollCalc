// map.js
import L from 'https://esm.sh/leaflet@1.9.4'
import { stationLabelFromKey, getAppLanguage } from './i18n.js'

let map = null
let routeLayer = null
let tollStationMarkers = []

export function getMap () {
  return map
}

export function initMap (targetId = 'map') {
  map = L.map(targetId, { zoomControl: false }).setView([44.8, 20.5], 7)
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  tiles.on('tileerror', () => {
    const el = document.getElementById('msg')
    if (el) el.textContent = 'Map tiles failed to load. Check internet or proxy settings.'
  })

  return map
}

export function makeLabelMarker (point, extraClass) {
  const label = stationLabelFromKey(point.name, getAppLanguage())
  return L.marker([point.lat, point.lon], {
    icon: L.divIcon({
      className: `toll-label ${extraClass || ''}`,
      html: `<span class="toll-dot"></span><span class="toll-text">${label}</span>`,
      iconAnchor: [0, 0]
    })
  })
}

export function drawPolyline (coords) {
  clearRoute()
  routeLayer = L.polyline(coords, { weight: 5 }).addTo(map)
  map.fitBounds(routeLayer.getBounds(), { padding: [30, 30] })
}

export function renderSectionRampsOnMap (sections) {
  if (!sections) return
  for (const section of sections) {
    if (section.enter) tollStationMarkers.push(makeLabelMarker(section.enter, 'enter').addTo(map))
    if (section.exit) tollStationMarkers.push(makeLabelMarker(section.exit, 'exit').addTo(map))
  }
}

export function clearRoute () {
  if (routeLayer) {
    map.removeLayer(routeLayer)
    routeLayer = null
  }
  if (tollStationMarkers.length) {
    for (const m of tollStationMarkers) if (m) map.removeLayer(m)
    tollStationMarkers = []
  }
}

export function addMapClick (handler) {
  map.on('click', handler)
}

export function addMarker (lat, lon, tooltipText, open = false) {
  const marker = L.marker([lat, lon]).addTo(map).bindTooltip(tooltipText)
  if (open) marker.openTooltip()
  return marker
}

export function removeMarker (marker) {
  if (marker) map.removeLayer(marker)
}

export function invalidateAfter (ms = 300) {
  setTimeout(() => map.invalidateSize(), ms)
}
