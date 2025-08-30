// matrix.js — load/query multiple square CSV matrices (first row = headers, no first column)

const Matrix = (() => {
  // ---- Configure your files here (name -> relative path) ----
  const REGISTRY = {
    A1S: 'data/csv/A1S.csv',
    A2: 'data/csv/A2.csv',
    A3_A8: 'data/csv/A3_A8.csv',
    A1J_A5_A4: 'data/csv/A1J_A5_A4.csv'
  }

  // name -> { labels: string[], grid: Map(exit -> Map(entry -> number|null)) }
  const CACHE = new Map()

  const norm = s =>
    String(s ?? '')
      .replace(/\uFEFF/g, '')
      .trim()
  const toNum = v => {
    const t = norm(v)
    if (!t || t.toUpperCase() === 'X') return null
    const n = Number(t.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }

  async function fetchText (path) {
    const res = await fetch(path)
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
    return res.text()
  }

  function parseSquareCSVToTable (text) {
    const { data } = Papa.parse(text, { header: false, skipEmptyLines: true })
    if (!data?.length) return { labels: [], grid: new Map() }

    const labels = data[0].map(norm) // entries & exits (same list)
    const grid = new Map()

    for (let r = 1; r < data.length; r++) {
      const exitName = labels[r - 1] // row r corresponds to labels[r-1]
      if (!exitName) continue

      const rowArr = data[r]
      const rowMap = new Map()
      for (let c = 0; c < labels.length; c++) {
        rowMap.set(labels[c], toNum(rowArr[c]))
      }
      grid.set(exitName, rowMap)
    }
    return { labels, grid }
  }

  async function loadOne (name) {
    if (CACHE.has(name)) return CACHE.get(name)
    const path = REGISTRY[name]
    if (!path) throw new Error(`Unknown matrix: ${name}`)
    const text = await fetchText(path)
    const table = parseSquareCSVToTable(text)
    CACHE.set(name, table)
    return table
  }

  return {
    // Preload all files (optional). Call once at startup.
    async initAll () {
      await Promise.all(Object.keys(REGISTRY).map(loadOne))
    },

    // Preload only a subset (optional).
    async init (names) {
      await Promise.all(names.map(loadOne))
    },

    // Lazy: ensure a table is ready; loads if missing.
    async ensure (name) {
      return loadOne(name)
    },

    // Get price or null. Loads lazily if needed.
    async get (name, entry, exit) {
      const enterRamp = entry?.name ?? entry
      const exitRamp = exit?.name ?? exit
      const t = await loadOne(name)
      const row = t.grid.get(norm(exitRamp))
      return row ? row.get(norm(enterRamp)) ?? null : null
    },

    // Introspection / UI helpers
    listTables () {
      return Object.keys(REGISTRY)
    },
    async entries (name) {
      return (await loadOne(name)).labels
    },
    async exits (name) {
      return (await loadOne(name)).labels
    }
  }
})()
