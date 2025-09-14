// app.js
import { Matrix } from './matrix.js'
import { init as initAddressSearch } from './search.js'
import { SMALL_SCREEN_LIMIT } from './constants.js'
import { loadStations } from './data.js'
import {
  initMap,
  getMap,
  drawPolyline,
  renderSectionRampsOnMap,
  clearRoute,
  addMapClick,
  addMarker,
  removeMarker,
  invalidateAfter
} from './map.js'
import { nls, setLocale, applyLocaleTexts, getAppLanguage } from './i18n.js'
import { startEndToRouteData, computeRamps, computeRampCharges } from './routing.js'
import { reverseToShortAddress } from './utils.js'
import { setAddressField, updateDistance, updatePrice, showMessage } from './ui.js'
import { getCurrentLocationWithAddress, checkGeolocationAvailability } from './geolocation.js'

let navStart = null
let navEnd = null
let navStartMarker = null
let navEndMarker = null

function clearSide (which) {
  if (which === 'start') {
    navStart = null
    if (navStartMarker) {
      removeMarker(navStartMarker)
      navStartMarker = null
    }
  } else {
    navEnd = null
    if (navEndMarker) {
      removeMarker(navEndMarker)
      navEndMarker = null
    }
  }
  document.querySelector('.pills').style.display = 'none'
  updateDistance('')
  updatePrice('')
  showMessage('')
  clearRoute()
}

function reset () {
  navStart = navEnd = null
  if (navStartMarker) {
    removeMarker(navStartMarker)
    navStartMarker = null
  }
  if (navEndMarker) {
    removeMarker(navEndMarker)
    navEndMarker = null
  }
  setAddressField('startAddress', '')
  setAddressField('endAddress', '')
  document.querySelector('.pills').style.display = 'none'
  showMessage('')
  clearRoute()
}

async function drawRoute (start, end) {
  showMessage(nls().FINDING_ROUTE + '...')
  try {
    const [distance, coords] = await startEndToRouteData(start, end)
    drawPolyline(coords)
    updateDistance((distance / 1000).toFixed(1) + ' ' + nls().KM)

    const sections = computeRamps(coords)
    renderSectionRampsOnMap(sections)

    const charges = await computeRampCharges(sections)
    updatePrice((charges.price_rsd ?? 0) + ' ' + nls().RSD)
    console.log('Charged (ramp):', charges.price_rsd)

    document.querySelector('.pills').style.display = 'flex'
    showMessage('')
  } catch (err) {
    console.error(err)
    showMessage(nls().ROUTING_FAILED)
  }
}

async function onMapClick (e) {
  const pos = [e.latlng.lat, e.latlng.lng]
  if (!navStart) {
    navStart = pos
    navStartMarker = addMarker(pos[0], pos[1], nls().START, true)
    showMessage('')
    try {
      const shortAddr = await reverseToShortAddress(navStart)
      setAddressField('startAddress', shortAddr)
    } catch {
      setAddressField('startAddress', `${navStart[0].toFixed(5)}, ${navStart[1].toFixed(5)}`)
    }
  } else if (!navEnd) {
    navEnd = pos
    navEndMarker = addMarker(pos[0], pos[1], nls().DESTINATION, true)
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

function initSidebarToggle () {
  const toggleBtn = document.getElementById('toggleSidebarBtn')
  const pills = document.querySelector('.pills')
  const sidebar = document.querySelector('.sidebar')
  const mapWrap = document.querySelector('.map-wrap')

  if (!toggleBtn) return

  toggleBtn.onclick = () => {
    const isMobile = window.innerWidth < SMALL_SCREEN_LIMIT
    document.body.classList.toggle(isMobile ? 'sidebar-collapsed-mobile' : 'sidebar-collapsed')
    toggleBtn.classList.toggle('collapsed')

    if (document.body.classList.contains('sidebar-collapsed')) {
      mapWrap.appendChild(pills)
    } else {
      sidebar.appendChild(pills)
    }
    invalidateAfter(300)
  }
}

function initLocaleUI () {
  const langSelect = document.getElementById('langSelect')
  if (langSelect) {
    langSelect.value = getAppLanguage()
    langSelect.addEventListener('change', () => {
      setLocale(langSelect.value)
      reset()
    })
  }
  applyLocaleTexts()
}

function initAddressInputs () {
  const startEl = document.getElementById('startAddress')
  const endEl = document.getElementById('endAddress')
  const onAddressInput = e => {
    if (e.target.value.trim() === '') clearSide(e.target.id === 'startAddress' ? 'start' : 'end')
  }
  startEl?.addEventListener('input', onAddressInput)
  endEl?.addEventListener('input', onAddressInput)
}

async function initLocationButton () {
  const locationBtn = document.getElementById('locationBtn')
  if (!locationBtn) return

  // Check if geolocation is available
  const isAvailable = await checkGeolocationAvailability()
  if (!isAvailable) {
    locationBtn.style.display = 'none'
    return
  }

  locationBtn.addEventListener('click', async () => {
    locationBtn.disabled = true
    locationBtn.classList.add('loading')
    
    try {
      showMessage(nls().GETTING_LOCATION + '...')
      
      const location = await getCurrentLocationWithAddress()
      
      // Clear existing start location
      if (navStartMarker) {
        removeMarker(navStartMarker)
        navStartMarker = null
      }
      
      // Set new start location
      navStart = [location.lat, location.lon]
      navStartMarker = addMarker(location.lat, location.lon, nls().CURRENT_LOCATION, true)
      setAddressField('startAddress', location.address)
      
      // If destination exists, draw route
      if (navEnd) {
        await drawRoute(navStart, navEnd)
      } else {
        showMessage('')
      }
      
    } catch (error) {
      console.error('Geolocation error:', error)
      let message = nls().LOCATION_UNAVAILABLE
      
      if (error.message.includes('denied')) {
        message = nls().LOCATION_DENIED
      } else if (error.message.includes('timeout')) {
        message = nls().LOCATION_TIMEOUT
      }
      
      showMessage(message)
    } finally {
      locationBtn.disabled = false
      locationBtn.classList.remove('loading')
    }
  })
}

async function autoSetCurrentLocation() {
  // Only auto-populate if start address is empty and geolocation is available
  const startEl = document.getElementById('startAddress')
  if (!startEl || startEl.value.trim() !== '') return

  const isAvailable = await checkGeolocationAvailability()
  if (!isAvailable) return

  try {
    showMessage(nls().GETTING_LOCATION + '...')
    
    const location = await getCurrentLocationWithAddress()
    
    // Set start location
    navStart = [location.lat, location.lon]
    navStartMarker = addMarker(location.lat, location.lon, nls().CURRENT_LOCATION, true)
    setAddressField('startAddress', location.address)
    
    showMessage('')
  } catch (error) {
    console.warn('Auto-location failed:', error)
    // Silently fail for auto-population, don't show error to user
    showMessage('')
  }
}

async function init () {
  initMap('map')
  initSidebarToggle()
  initLocaleUI()
  initAddressInputs()
  initLocationButton()

  document.getElementById('resetBtn')?.addEventListener('click', reset)
  document.getElementById('clearBtn')?.addEventListener('click', reset)

  addMapClick(onMapClick)

  // Address search (Nominatim)
  initAddressSearch({
    countrycodes: 'rs',
    bounded: false,
    getViewbox: () => {
      const b = getMap().getBounds()
      return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',')
    },
    labelFn: item => {
      // Prefer short formatted address if available
      const addr = item.address
      if (!addr) return item.display_name
      const parts = []
      const street = addr.road || addr.pedestrian || addr.footway || addr.street || addr.path || addr.cycleway || ''
      const houseNo = addr.house_number ? ` ${addr.house_number}` : ''
      const place =
        addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || addr.city_district || addr.suburb || addr.county || ''
      if (street) parts.push(street + houseNo)
      if (place) parts.push(place)
      return parts.join(', ') || item.display_name
    },
    lang: nls().acceptLang,
    onStartPick: ({ lat, lon, label }) => {
      if (navStartMarker) {
        removeMarker(navStartMarker)
        navStartMarker = null
      }
      navStart = [lat, lon]
      navStartMarker = addMarker(lat, lon, nls().START, true)
      const s = document.getElementById('startAddress')
      if (s) s.value = label
      if (navEnd) drawRoute(navStart, navEnd)
    },
    onEndPick: ({ lat, lon, label }) => {
      if (navEndMarker) {
        removeMarker(navEndMarker)
        navEndMarker = null
      }
      navEnd = [lat, lon]
      navEndMarker = addMarker(lat, lon, nls().DESTINATION, true)
      const e = document.getElementById('endAddress')
      if (e) e.value = label
      if (navStart) drawRoute(navStart, navEnd)
    }
  })

  // Auto-populate start location with current position
  await autoSetCurrentLocation()
}

;(async function enter () {
  try {
    await loadStations()
    await Matrix.initAll()
    await init()
  } catch (err) {
    console.error('Failed to initialize:', err)
  }
})()
