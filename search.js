// search.js — tiny Nominatim autocomplete with robust close-on-pick
;(function () {
  function debounce (fn, ms) {
    let t
    return (...a) => {
      clearTimeout(t)
      t = setTimeout(() => fn(...a), ms)
    }
  }

  function urlOf (q, opts = {}) {
    const p = new URLSearchParams({
      q,
      format: 'jsonv2',
      addressdetails: '1',
      limit: String(opts.limit ?? 8)
    })
    if (opts.countrycodes) p.set('countrycodes', opts.countrycodes)
    if (opts.viewbox && opts.bounded) {
      p.set('viewbox', opts.viewbox)
      p.set('bounded', '1')
    }
    return `https://nominatim.openstreetmap.org/search?${p.toString()}`
  }

  // Use your formatter if present (formatAddressParts), else a compact fallback
  function defaultLabel (item) {
    if (typeof window.formatAddressParts === 'function') {
      return window.formatAddressParts(item.address) || item.display_name
    }
    const a = item.address || {}
    const street = [a.road, a.house_number].filter(Boolean).join(' ')
    const place = a.city || a.town || a.village || a.municipality || a.county || ''
    return [street, place, a.postcode, a.country].filter(Boolean).join(', ') || item.display_name
  }

  class Autocomplete {
    constructor (inputEl, opts = {}, onSelect = () => {}) {
      this.input = inputEl
      this.opts = opts
      this.onSelect = onSelect
      this.items = []
      this.activeIndex = -1
      this.labelFn = opts.labelFn || defaultLabel

      // dropdown container appended next to input
      this.list = document.createElement('div')
      this.list.className = 'ac-list'
      const wrap = this.input.parentElement || this.input
      if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative'
      wrap.appendChild(this.list)

      this.input.addEventListener('input', debounce(this.handleInput.bind(this), 250))
      this.input.addEventListener('keydown', this.handleKey.bind(this))
      this.input.addEventListener('blur', () => setTimeout(() => this.hide(), 150))
    }

    async handleInput () {
      const q = this.input.value.trim()
      if (!q) return this.hide()
      try {
        const res = await fetch(urlOf(q, this.opts), { headers: { 'Accept-Language': this.opts.lang || 'sr,en;q=0.8' } })
        const data = await res.json()
        this.items = Array.isArray(data) ? data : []
        this.render()
      } catch (e) {
        console.error('Autocomplete fetch failed', e)
        this.hide()
      }
    }

    render () {
      this.list.innerHTML = ''
      this.activeIndex = -1
      if (!this.items.length) {
        this.hide()
        return
      }
      this.items.forEach((item, idx) => {
        const el = document.createElement('div')
        el.className = 'ac-item'
        el.innerHTML = `<div>${this.labelFn(item)}</div><div class="ac-muted">${item.type || item.class || ''}</div>`
        // mousedown so it triggers before input blur
        el.addEventListener('mousedown', ev => {
          ev.preventDefault()
          this.choose(idx)
        })
        this.list.appendChild(el)
      })
      this.list.style.display = 'block'
    }

    handleKey (e) {
      if (this.list.style.display !== 'block') return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.move(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.move(-1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (this.activeIndex >= 0) this.choose(this.activeIndex)
      } else if (e.key === 'Escape') {
        this.hide()
      }
    }

    move (delta) {
      const ch = Array.from(this.list.children)
      if (!ch.length) return
      this.activeIndex = (this.activeIndex + delta + ch.length) % ch.length
      ch.forEach((el, i) => el.classList.toggle('active', i === this.activeIndex))
      ch[this.activeIndex].scrollIntoView({ block: 'nearest' })
    }

    choose (idx) {
      const item = this.items[idx]
      if (!item) return
      const label = this.labelFn(item)
      this.input.value = label
      this.onSelect({ label, lat: +item.lat, lon: +item.lon, raw: item })
      this.hide()
      this.input.blur() // ensure dropdown stays closed
    }

    hide () {
      this.list.style.display = 'none'
      this.list.innerHTML = ''
      this.items = []
      this.activeIndex = -1
    }
  }

  // Convenience wiring for your Start/End fields
  function init (options = {}) {
    const startEl = document.getElementById(options.startId || 'startAddress')
    const endEl = document.getElementById(options.endId || 'endAddress')
    if (!startEl || !endEl) return

    let viewbox = null
    try {
      if (typeof options.getViewbox === 'function') viewbox = options.getViewbox()
    } catch {}

    const common = {
      countrycodes: options.countrycodes ?? 'rs',
      limit: options.limit ?? 8,
      lang: options.lang || 'sr,en;q=0.8',
      viewbox,
      bounded: !!options.bounded,
      labelFn: options.labelFn
    }

    new Autocomplete(startEl, common, options.onStartPick || (() => {}))
    new Autocomplete(endEl, common, options.onEndPick || (() => {}))
  }

  window.AddressSearch = { Autocomplete, init }
})()
