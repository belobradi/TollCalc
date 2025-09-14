// i18n.js
import { LOCALE_LANGUAGE } from './constants.js'

export const LOCALES = {
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
    GETTING_LOCATION: 'Dobijam trenutnu lokaciju',
    LOCATION_DENIED: 'Pristup lokaciji je odbijen',
    LOCATION_UNAVAILABLE: 'Lokacija nije dostupna',
    LOCATION_TIMEOUT: 'Zahtev za lokaciju je istekao',
    CURRENT_LOCATION: 'Trenutna lokacija',
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
    GETTING_LOCATION: 'Добијам тренутну локацију',
    LOCATION_DENIED: 'Приступ локацији је одбијен',
    LOCATION_UNAVAILABLE: 'Локација није доступна',
    LOCATION_TIMEOUT: 'Захтев за локацију је истекао',
    CURRENT_LOCATION: 'Тренутна локација',
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
    GETTING_LOCATION: 'Getting current location',
    LOCATION_DENIED: 'Location access denied',
    LOCATION_UNAVAILABLE: 'Location unavailable',
    LOCATION_TIMEOUT: 'Location request timed out',
    CURRENT_LOCATION: 'Current location',
    KM: 'km',
    RSD: 'RSD',
    acceptLang: 'en,sr;q=0.8',
    htmlLang: 'en'
  }
}

// Station label overrides (Cyrillic)
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
  PIROT_ISTОK: 'Пирот исток'
}

const EN_OVERRIDES = { BEOGRAD: 'Belgrade' }

function titleCaseKey (key) {
  return String(key || '')
    .toLowerCase()
    .split('_')
    .map(w => w[0]?.toUpperCase() + w.slice(1))
    .join(' ')
}
function stripDiacritics (s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
function cyrlToLatn (s) {
  const m = {
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
    .map(ch => m[ch] ?? ch)
    .join('')
}

export function stationLabelFromKey (key, lang) {
  const cyrl = STATION_OVERRIDES_CYRL[key] || titleCaseKey(key)
  if (lang === 'sr-Cyrl') return cyrl
  const latn = cyrlToLatn(cyrl)
  if (lang === 'en') return EN_OVERRIDES[key] || stripDiacritics(latn)
  return latn // sr-Latn
}

let appLanguage = localStorage.getItem(LOCALE_LANGUAGE) || 'sr-Latn'

export function nls () {
  return LOCALES[appLanguage] || LOCALES['sr-Latn']
}

export function setLocale (loc) {
  appLanguage = LOCALES[loc] ? loc : 'sr-Latn'
  localStorage.setItem(LOCALE_LANGUAGE, appLanguage)
  document.documentElement.setAttribute('lang', nls().htmlLang)
  applyLocaleTexts()
}

export function getAppLanguage () {
  return appLanguage
}

export function applyLocaleTexts () {
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
