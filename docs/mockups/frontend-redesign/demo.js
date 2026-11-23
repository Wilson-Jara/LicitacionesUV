const root = document.documentElement
const themeButton = document.querySelector('.theme-button')
const themeKey = 'licitacionesuv-redesign-theme'
const preferredDark = window.matchMedia('(prefers-color-scheme: dark)')

function readTheme() {
  try {
    return localStorage.getItem(themeKey)
  } catch {
    return null
  }
}

function setTheme(theme) {
  root.dataset.theme = theme
  themeButton.setAttribute('aria-pressed', String(theme === 'oscuro'))
}

setTheme(readTheme() ?? (preferredDark.matches ? 'oscuro' : 'claro'))
preferredDark.addEventListener('change', (event) => {
  if (!readTheme()) setTheme(event.matches ? 'oscuro' : 'claro')
})

themeButton.addEventListener('click', () => {
  const next = root.dataset.theme === 'oscuro' ? 'claro' : 'oscuro'
  setTheme(next)
  try {
    localStorage.setItem(themeKey, next)
  } catch {
    // The theme can still be changed for this page when storage is disabled.
  }
})

const searchForm = document.querySelector('#search-form')
const accessForm = document.querySelector('#access-form')

if (searchForm) initializeCatalog()
if (accessForm) initializeAccess()

function initializeCatalog() {
  const regions = {
    antofagasta: 'Antofagasta',
    biobio: 'Biobío',
    metropolitana: 'Metropolitana',
    valparaiso: 'Valparaíso',
  }
  const types = { publica: 'Pública', privada: 'Privada' }
  const catalog = [
    {
      title: 'Servicio de mantenimiento de infraestructura',
      institution: 'Universidad de Valparaíso',
      region: 'valparaiso',
      type: 'publica',
      closingDate: '2026-12-04',
      amount: 12_500_000,
    },
    {
      title: 'Adquisición de equipamiento tecnológico',
      institution: 'Empresa privada de servicios',
      region: 'metropolitana',
      type: 'privada',
      closingDate: '2026-12-10',
      amount: 8_700_000,
    },
    {
      title: 'Consultoría en seguridad de la información',
      institution: 'Ministerio del Interior',
      region: 'metropolitana',
      type: 'publica',
      closingDate: '2026-11-14',
      amount: 4_500_000,
    },
    {
      title: 'Desarrollo de sistema de gestión interna',
      institution: 'Banco Internacional',
      region: 'biobio',
      type: 'privada',
      closingDate: '2026-12-20',
      amount: 15_000_000,
    },
    {
      title: 'Renovación de licencias de software',
      institution: 'Municipalidad de Viña del Mar',
      region: 'valparaiso',
      type: 'publica',
      closingDate: '2026-12-17',
      amount: 3_200_000,
    },
    {
      title: 'Auditoría financiera anual',
      institution: 'Corporación Privada',
      region: 'antofagasta',
      type: 'privada',
      closingDate: '2026-11-12',
      amount: 6_000_000,
    },
  ]
  const sampleDate = '2026-11-19'
  const dateFormat = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const amountFormat = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
  const sorters = {
    'fecha-asc': (a, b) => a.closingDate.localeCompare(b.closingDate),
    'fecha-desc': (a, b) => b.closingDate.localeCompare(a.closingDate),
    'monto-asc': (a, b) => a.amount - b.amount,
    'monto-desc': (a, b) => b.amount - a.amount,
  }
  const normalize = (value) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const formatDate = (date) => dateFormat.format(new Date(date))
  const status = (date) => (date >= sampleDate ? 'Vigente' : 'Cerrada')

  const query = document.querySelector('#query')
  const queryExamples = [...searchForm.querySelectorAll('[data-query]')]
  const region = document.querySelector('#region')
  const sort = document.querySelector('#sort')
  const typeOptions = [...document.querySelectorAll('input[name="type"]')]
  const count = document.querySelector('#result-count')
  const results = document.querySelector('#tender-list')
  const empty = document.querySelector('#empty')
  const template = document.querySelector('#tender-template')
  const dialog = document.querySelector('#tender-dialog')
  const filtersPanel = document.querySelector('#filters-panel')
  const compact = window.matchMedia('(max-width: 45rem)')
  filtersPanel.open = !compact.matches
  compact.addEventListener('change', (event) => {
    filtersPanel.open = !event.matches
  })

  function readFilters() {
    const params = new URLSearchParams(window.location.search)
    query.value = params.get('q') ?? ''
    region.value = [...region.options].some((option) => option.value === params.get('region'))
      ? params.get('region')
      : ''
    sort.value = Object.hasOwn(sorters, params.get('sort')) ? params.get('sort') : ''
    const currentType = typeOptions.find((option) => option.value === params.get('type'))
    const selectedType = currentType ?? typeOptions[0]
    selectedType.checked = true
  }

  function updateURL(filters) {
    const url = new URL(window.location.href)
    if (url.protocol === 'file:') return
    for (const [key, value] of Object.entries(filters)) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    if (url.href !== window.location.href) window.history.replaceState(null, '', url)
  }

  function openDetail(tender) {
    dialog.querySelector('#detail-title').textContent = tender.title
    dialog.querySelector('#detail-institution').textContent = tender.institution
    const fields = [
      ['Región', regions[tender.region]],
      ['Tipo', types[tender.type]],
      ['Cierre', formatDate(tender.closingDate)],
      ['Monto estimado', amountFormat.format(tender.amount)],
      ['Estado', status(tender.closingDate)],
    ]
    dialog.querySelector('#detail-fields').replaceChildren(
      ...fields.map(([label, value]) => {
        const group = document.createElement('div')
        const term = document.createElement('dt')
        const description = document.createElement('dd')
        term.textContent = label
        description.textContent = value
        group.append(term, description)
        return group
      }),
    )
    dialog.showModal()
  }

  function createRow(tender) {
    const row = template.content.cloneNode(true)
    row.querySelector('.tender-type').textContent = types[tender.type]
    row.querySelector('.tender-region').textContent = regions[tender.region]
    row.querySelector('.tender-institution').textContent = tender.institution
    row.querySelector('.tender-amount').textContent = amountFormat.format(tender.amount)
    const title = row.querySelector('.tender-title')
    title.textContent = tender.title
    title.addEventListener('click', () => openDetail(tender))
    const closing = row.querySelector('time')
    closing.dateTime = tender.closingDate
    closing.textContent = formatDate(tender.closingDate)
    const state = row.querySelector('.tender-status')
    state.textContent = status(tender.closingDate)
    state.dataset.status = state.textContent.toLowerCase()
    return row
  }

  function render() {
    const filters = {
      q: query.value.trim(),
      region: region.value,
      type: typeOptions.find((option) => option.checked).value,
      sort: sort.value,
    }
    const keyword = normalize(filters.q)
    for (const example of queryExamples) {
      example.setAttribute('aria-pressed', String(normalize(example.dataset.query) === keyword))
    }
    const filtered = catalog.filter(
      (tender) =>
        (!keyword || normalize(tender.title).includes(keyword)) &&
        (!filters.region || tender.region === filters.region) &&
        (!filters.type || tender.type === filters.type),
    )
    if (filters.sort) filtered.sort(sorters[filters.sort])
    count.textContent =
      filtered.length === 1
        ? '1 licitación en el catálogo'
        : `${filtered.length} licitaciones en el catálogo`
    results.replaceChildren(...filtered.map(createRow))
    results.hidden = filtered.length === 0
    empty.hidden = filtered.length > 0
    updateURL(filters)
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault()
    render()
  })
  query.addEventListener('input', render)
  for (const example of queryExamples) {
    example.addEventListener('click', () => {
      query.value = example.getAttribute('aria-pressed') === 'true' ? '' : example.dataset.query
      render()
    })
  }
  region.addEventListener('change', render)
  sort.addEventListener('change', render)
  typeOptions.forEach((option) => option.addEventListener('change', render))
  document.querySelectorAll('[data-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      query.value = ''
      region.value = ''
      sort.value = ''
      typeOptions[0].checked = true
      render()
      query.focus()
    })
  })

  readFilters()
  render()
}

function initializeAccess() {
  const email = document.querySelector('#email')
  const password = document.querySelector('#password')
  const message = accessForm.querySelector('[role="status"]')
  const toggle = accessForm.querySelector('.password-toggle')
  const sampleEmail = 'demo@ejemplo.cl'
  const samplePassword = 'acceso-demo'

  toggle.addEventListener('click', () => {
    const show = password.type === 'password'
    password.type = show ? 'text' : 'password'
    toggle.textContent = show ? 'Ocultar' : 'Mostrar'
  })
  accessForm.querySelector('.fill-demo').addEventListener('click', () => {
    email.value = sampleEmail
    password.value = samplePassword
    message.removeAttribute('data-error')
    message.textContent = 'Datos de ejemplo listos. Ya puedes iniciar la sesión de prueba.'
  })
  accessForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const valid = email.value === sampleEmail && password.value === samplePassword
    message.toggleAttribute('data-error', !valid)
    message.textContent = valid
      ? 'Sesión de demostración iniciada.'
      : 'Usa el botón «Rellenar con datos de ejemplo» y vuelve a intentarlo.'
  })
}
