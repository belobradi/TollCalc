import { Matrix } from './matrix.js'
import { init as initAddressSearch } from './search.js'

// --- Constants & Helpers ---
const EARTH_RADIUS_M = 6367e3
const SMALL_SCREEN_LIMIT = 768 // px

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

// --- Locale/i18n (lightweight) ---
const LOCALE_LANGUAGE = 'tollcalc.language'
const LOCALES = {
  'sr-Latn': {
    CHOOSE_START_ADDRESS: 'Odaberite adresu polaska',
    CHOOSE_DESTINATION: 'Odaberite destinaciju',
    VEHICLE_CATEGORY: 'Kategorija vozila',
    K1_CAR: 'K1 (Automobil)',
    RESET: 'Poništi',
    DISTANCE: 'Kilometraža',
    ESTIMATED_PRICE: 'Okvirna cena',
    START: 'Start',
    DESTINATION: 'Destinacija',
    FINDING_ROUTE: 'Tražim putanju',
    ROUTING_FAILED: 'Rutiranje nije uspelo (mreža/OSRM).',
    KM: 'km',
    RSD: 'din',
    acceptLang: 'sr,en;q=0.8',
    htmlLang: 'sr'
  },
  'sr-Cyrl': {
    CHOOSE_START_ADDRESS: 'Одаберите адресу поласка',
    CHOOSE_DESTINATION: 'Одаберите дестинацију',
    VEHICLE_CATEGORY: 'Категорија возила',
    K1_CAR: 'K1 (Аутомобил)',
    RESET: 'Поништи',
    DISTANCE: 'Километража',
    ESTIMATED_PRICE: 'Оквирна цена',
    START: 'Старт',
    DESTINATION: 'Дестинација',
    FINDING_ROUTE: 'Тражим путању',
    ROUTING_FAILED: 'Рутирање није успело (мрежа/OSRM).',
    KM: 'км',
    RSD: 'дин',
    acceptLang: 'sr,en;q=0.8',
    htmlLang: 'sr'
  },
  en: {
    CHOOSE_START_ADDRESS: 'Choose start address',
    CHOOSE_DESTINATION: 'Choose destination',
    VEHICLE_CATEGORY: 'Vehicle category',
    K1_CAR: 'K1 (Car)',
    RESET: 'Reset',
    DISTANCE: 'Distance',
    ESTIMATED_PRICE: 'Estimated price',
    START: 'Start',
    DESTINATION: 'Destination',
    FINDING_ROUTE: 'Finding route',
    ROUTING_FAILED: 'Routing failed (network/OSRM).',
    KM: 'km',
    RSD: 'RSD',
    acceptLang: 'en,sr;q=0.8',
    htmlLang: 'en'
  }
}

// --- Station labels (i18n) ---
const STATION_OVERRIDES_CYRL = {
  SUBOTICA: 'Суботица',
  ZEDNIK: 'Жедник',
  BACKA_TOPOLA: 'Бачка Топола',
  FEKETIC: 'Фекетић',
  VRBAS: 'Врбас',
  ZMAJEVO: 'Змајево',
  NOVI_SAD: 'Нови Сад',
  KOVILJ: 'Ковиљ',
  BESKA: 'Бешка',
  MEDERIK: 'Медерик',
  INDJIJA: 'Инђија',
  STARA_PAZOVA: 'Стара Пазова',
  SIMANOVCI: 'Шимановци',
  PECINCI: 'Пећинци',
  RUMA: 'Рума',
  SREMSKA_MITROVICA: 'Сремска Митровица',
  KUZMIN: 'Кузмин',
  ADASEVCI: 'Адашевци',
  SID: 'Шид',
  HRTKOVCI: 'Хртковци',
  SABAC: 'Шабац',
  OBRENOVAC: 'Обреновац',
  UB: 'Уб',
  LAJKOVAC: 'Лајковац',
  LJIG: 'Љиг',
  TAKOVO: 'Таково',
  PRELJINA: 'Прељина',
  PAKOVRACE: 'Паковраће',
  LUCANI: 'Лучани',
  PRILIPAC: 'Прилипац',
  BEOGRAD: 'Београд',
  MALI_POZAREVAC: 'Мали Пожаревац',
  UMCARI: 'Умчари',
  VODANJ: 'Водањ',
  KOLARI: 'Колари',
  SMEDEREVO: 'Смедерево',
  POZAREVAC: 'Пожаревац',
  VELIKA_PLANA: 'Велика Плана',
  MARKOVAC: 'Марковац',
  LAPOVO: 'Лапово',
  BATOCINA: 'Баточина',
  JAGODINA: 'Јагодина',
  CUPRIJA: 'Ћуприја',
  PARACIN: 'Параћин',
  RAZANJ: 'Ражањ',
  ALEKS_RUDNICI: 'Алексиначки Рудници',
  ALEKSINAC: 'Алексинац',
  MEROSINA: 'Мерошина',
  DOLJEVAC: 'Дољевац',
  BRESTOVAC: 'Брестовац',
  GRDELICA: 'Грделица',
  PREDEJANE: 'Предејане',
  VLADUCIN_HAN: 'Владичин Хан',
  VRANJE: 'Врање',
  PRESEVO: 'Прешево',
  CICEVAC: 'Ћићевац',
  VELIKA_DRENOVA: 'Велика Дренова',
  TRSTENIK: 'Трстеник',
  VRNJACKA_BANJA: 'Врњачка Бања',
  BELA_PALANKA: 'Бела Паланка',
  DIMITROVGRAD: 'Димитровград',
  NIS_JUG: 'Ниш југ',
  NIS_SEVER: 'Ниш север',
  NIS_ISTOK: 'Ниш исток',
  NIS_MALCA: 'Ниш Малча',
  LESKOVAC_CENTAR: 'Лесковац центар',
  LESKOVAC_JUG: 'Лесковац југ',
  BUJANOVAC_SEVER: 'Бујановац север',
  BUJANOVAC_JUG: 'Бујановац југ',
  KRUSEVAC_ISTOK: 'Крушевац исток',
  KRUSEVAC_ZAPAD: 'Крушевац запад',
  PIROT_ZAPAD: 'Пирот запад',
  PIROT_ISTOK: 'Пирот исток'
}

function titleCaseKey (key) {
  return String(key || '')
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const EN_OVERRIDES = { BEOGRAD: 'Belgrade' }
function stripDiacritics (s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function cyrlToLatn (s) {
  const map = {
    А: 'A',
    Б: 'B',
    В: 'V',
    Г: 'G',
    Д: 'D',
    Ђ: 'Đ',
    Е: 'E',
    Ж: 'Ž',
    З: 'Z',
    И: 'I',
    Ј: 'J',
    К: 'K',
    Л: 'L',
    Љ: 'Lj',
    М: 'M',
    Н: 'N',
    Њ: 'Nj',
    О: 'O',
    П: 'P',
    Р: 'R',
    С: 'S',
    Т: 'T',
    Ћ: 'Ć',
    У: 'U',
    Ф: 'F',
    Х: 'H',
    Ц: 'C',
    Ч: 'Č',
    Џ: 'Dž',
    Ш: 'Š',
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    ђ: 'đ',
    е: 'e',
    ж: 'ž',
    з: 'z',
    и: 'i',
    ј: 'j',
    к: 'k',
    л: 'l',
    љ: 'lj',
    м: 'm',
    н: 'n',
    њ: 'nj',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    ћ: 'ć',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'č',
    џ: 'dž',
    ш: 'š'
  }
  return Array.from(s)
    .map(ch => map[ch] ?? ch)
    .join('')
}

function stationLabelFromKey (key, lang) {
  const cyrl = STATION_OVERRIDES_CYRL[key] || titleCaseKey(key)

  if (lang === 'sr-Cyrl') return cyrl

  const latn = cyrlToLatn(cyrl)
  if (lang === 'en') return EN_OVERRIDES[key] || stripDiacritics(latn)

  return latn
}

let appLanguage = localStorage.getItem(LOCALE_LANGUAGE) || 'sr-Latn'

function nls () {
  return LOCALES[appLanguage] || LOCALES['sr-Latn']
}

function setLocale (loc) {
  appLanguage = LOCALES[loc] ? loc : 'sr-Latn'
  localStorage.setItem(LOCALE_LANGUAGE, appLanguage)
  document.documentElement.setAttribute('lang', nls().htmlLang)
  applyLocaleTexts()
  reset()
}

function applyLocaleTexts () {
  const s = document.getElementById('startAddress')
  if (s) s.placeholder = nls().CHOOSE_START_ADDRESS
  const e = document.getElementById('endAddress')
  if (e) e.placeholder = nls().CHOOSE_DESTINATION

  const vehLbl = document.querySelector('label[for="vehicleCategory"]')
  if (vehLbl) vehLbl.textContent = nls().VEHICLE_CATEGORY
  const optK1 = document.querySelector('#vehicleCategory option[value="k1"]')
  if (optK1) optK1.textContent = nls().K1_CAR
  const resetBtn = document.getElementById('resetBtn')
  if (resetBtn) resetBtn.textContent = nls().RESET

  document.documentElement.removeAttribute('data-i18n')
}

// --- UI helpers ---
function makeLabelMarker (point, extraClass) {
  const label = stationLabelFromKey(point.name, appLanguage)
  return L.marker([point.lat, point.lon], {
    icon: L.divIcon({
      className: `toll-label ${extraClass || ''}`,
      html: `<span class="toll-dot"></span><span class="toll-text">${label}</span>`,
      iconAnchor: [0, 0]
    })
  })
}
function setAddressField (id, text) {
  const el = document.getElementById(id)
  if (el) el.value = text || ''
}
function updateDistance (t) {
  document.getElementById('distance').textContent = nls().DISTANCE + ': ' + t
}
function updatePrice (t) {
  document.getElementById('price').textContent = nls().ESTIMATED_PRICE + ': ' + t
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

  result.push(coords[coords.length - 1])
  return result
}

async function drawRoute (start, end) {
  showMessage(nls().FINDING_ROUTE + '...')
  try {
    let [distance, coords] = await startEndToRouteData(start, end)
    coords = densifyRoute(coords, 10)

    clearRoute()
    navRouteLayer = L.polyline(coords, { weight: 5 }).addTo(map)
    map.fitBounds(navRouteLayer.getBounds(), { padding: [30, 30] })

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

function formatAddressParts (addr) {
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

async function reverseToShortAddress ([lat, lon]) {
  const data = await reverseGeocode([lat, lon])
  return formatAddressParts(data.address) || data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

async function onMapClick (e) {
  const pos = [e.latlng.lat, e.latlng.lng]

  if (!navStart) {
    navStart = pos
    navStartMarker = L.marker(pos).addTo(map).bindTooltip(nls().START).openTooltip()
    showMessage('')

    try {
      const shortAddr = await reverseToShortAddress(navStart)
      setAddressField('startAddress', shortAddr)
    } catch {
      setAddressField('startAddress', `${navStart[0].toFixed(5)}, ${navStart[1].toFixed(5)}`)
    }
  } else if (!navEnd) {
    navEnd = pos
    navEndMarker = L.marker(pos).addTo(map).bindTooltip(nls().DESTINATION).openTooltip()

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

  setAddressField('startAddress', '')
  setAddressField('endAddress', '')

  document.querySelector('.pills').style.display = 'none'
  showMessage('')
  clearRoute()
}

function clearRoute () {
  if (navRouteLayer) {
    map.removeLayer(navRouteLayer)
    navRouteLayer = null
  }

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

  document.querySelector('.pills').style.display = 'none'
  updateDistance('')
  updatePrice('')
  showMessage('')
  clearRoute()
}

// --- Initialization ---
function init () {
  const toggleBtn = document.getElementById('toggleSidebarBtn')
  const pills = document.querySelector('.pills')
  const sidebar = document.querySelector('.sidebar')
  const mapWrap = document.querySelector('.map-wrap')

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      const isMobile = window.innerWidth < SMALL_SCREEN_LIMIT
      if (isMobile) {
        document.body.classList.toggle('sidebar-collapsed-mobile')
      } else {
        document.body.classList.toggle('sidebar-collapsed')
      }
      toggleBtn.classList.toggle('collapsed')

      // Move the pills div based on sidebar state
      if (document.body.classList.contains('sidebar-collapsed')) {
        // Sidebar is collapsed, move pills to map-wrap
        mapWrap.appendChild(pills)
      } else {
        // Sidebar is not collapsed, move pills to sidebar
        sidebar.appendChild(pills)
      }

      // Invalidate map size after transition to re-render tiles correctly
      setTimeout(() => map.invalidateSize(), 300)
    }
  }

  const langSelect = document.getElementById('langSelect')
  if (langSelect) {
    langSelect.value = appLanguage
    langSelect.addEventListener('change', () => setLocale(langSelect.value))
  }
  applyLocaleTexts()

  map = L.map('map', { zoomControl: false }).setView([44.8, 20.5], 7)
  L.control.zoom({ position: 'bottomright' }).addTo(map)

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

  const clearBtn = document.getElementById('clearBtn')
  if (clearBtn) clearBtn.onclick = reset

  const labelFn = item =>
    typeof formatAddressParts === 'function' ? formatAddressParts(item.address) || item.display_name : item.display_name

  initAddressSearch({
    countrycodes: 'rs',
    bounded: false,
    getViewbox: () => {
      const b = map.getBounds()
      return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',')
    },
    labelFn: item => (typeof formatAddressParts === 'function' ? formatAddressParts(item.address) || item.display_name : item.display_name),
    lang: nls().acceptLang,
    onStartPick: ({ lat, lon, label }) => {
      if (navStartMarker) {
        map.removeLayer(navStartMarker)
        navStartMarker = null
      }
      navStart = [lat, lon]
      navStartMarker = L.marker(navStart).addTo(map).bindTooltip(nls().START).openTooltip()
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
      navEndMarker = L.marker(navEnd).addTo(map).bindTooltip(nls().DESTINATION).openTooltip()
      const e = document.getElementById('endAddress')
      if (e) e.value = label
      if (navStart) drawRoute(navStart, navEnd)
    }
  })
}

// --- Entry point ---
async function enter () {
  try {
    STATIONS = await (await fetch('data/json/stations.json')).json()
    await Matrix.initAll()
    init()
  } catch (err) {
    console.error('Failed to load stations:', err)
  }
}

enter()
