;(() => {
  const STORE_KEY = 'ecogest_tramites'

  const initialState = {
    denuncias: [],
    permisos: [],
    licencias: [],
  }

  const getState = () => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (!raw) return { ...initialState }
      return { ...initialState, ...JSON.parse(raw) }
    } catch {
      return { ...initialState }
    }
  }

  const saveState = (state) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  }

  const genCode = (prefix, count) => {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(count + 1).padStart(5, '0')
    return `${prefix}-${yy}${mm}-${seq}`
  }

  const createAlert = (type, text) =>
    `<div class="alert alert-${type} mb-0">${text}</div>`

  const rifValid = (rif = '') => /^(J|G|V|E|P)-?\d{8}-?\d$/i.test(rif.trim())
  const phoneValid = (phone = '') => /^(0\d{3}|\d{3})-?\d{7}$/.test(phone.replace(/\s/g, ''))
  const emailValid = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const asObject = (form) => Object.fromEntries(new FormData(form).entries())

  const state = getState()

  const kpiDenuncias = document.getElementById('kpiDenuncias')
  const kpiPermisos = document.getElementById('kpiPermisos')
  const kpiLicencias = document.getElementById('kpiLicencias')

  const refreshKpis = () => {
    if (kpiDenuncias) kpiDenuncias.textContent = String(state.denuncias.length)
    if (kpiPermisos) kpiPermisos.textContent = String(state.permisos.length)
    if (kpiLicencias) kpiLicencias.textContent = String(state.licencias.length)
  }

  refreshKpis()

  // Leaflet map for denuncias
  const mapNode = document.getElementById('denunciaMap')
  const latField = document.getElementById('latitud')
  const lngField = document.getElementById('longitud')
  const geoLocateBtn = document.getElementById('geoLocateBtn')
  let leafletMap = null
  let marker = null

  if (mapNode && window.L) {
    leafletMap = window.L.map(mapNode).setView([7.7667, -72.2333], 12)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(leafletMap)

    leafletMap.on('click', (e) => {
      const { lat, lng } = e.latlng
      if (marker) leafletMap.removeLayer(marker)
      marker = window.L.marker([lat, lng]).addTo(leafletMap)
      if (latField) latField.value = lat.toFixed(6)
      if (lngField) lngField.value = lng.toFixed(6)
    })
  }

  geoLocateBtn?.addEventListener('click', () => {
    if (!navigator.geolocation || !leafletMap) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        leafletMap.setView([lat, lng], 15)
        if (marker) leafletMap.removeLayer(marker)
        marker = window.L.marker([lat, lng]).addTo(leafletMap)
        if (latField) latField.value = lat.toFixed(6)
        if (lngField) lngField.value = lng.toFixed(6)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    )
  })

  const denunciaForm = document.getElementById('denunciaForm')
  const denunciaFeedback = document.getElementById('denunciaFeedback')
  denunciaForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = asObject(denunciaForm)
    if (!data.titulo?.trim() || !data.tipo || !data.estadoUbicacion || !data.municipio || !data.documento) {
      denunciaFeedback.innerHTML = createAlert('danger', 'Completa todos los campos obligatorios de la denuncia.')
      return
    }
    if ((data.descripcion || '').trim().length < 50) {
      denunciaFeedback.innerHTML = createAlert('warning', 'La descripcion debe tener minimo 50 caracteres.')
      return
    }

    const code = genCode('DEN', state.denuncias.length)
    state.denuncias.unshift({
      code,
      doc: data.documento.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      ...data,
    })
    saveState(state)
    refreshKpis()
    denunciaFeedback.innerHTML = createAlert('success', `Denuncia enviada. Codigo de seguimiento: <strong>${code}</strong>`)
    denunciaForm.reset()
    if (latField) latField.value = ''
    if (lngField) lngField.value = ''
    if (marker && leafletMap) {
      leafletMap.removeLayer(marker)
      marker = null
    }
  })

  const permisoForm = document.getElementById('permisoForm')
  const permisoFeedback = document.getElementById('permisoFeedback')
  permisoForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = asObject(permisoForm)
    if (!data.tipoPermiso || !data.razonSocial || !data.rif || !data.email || !data.telefono) {
      permisoFeedback.innerHTML = createAlert('danger', 'Completa los datos obligatorios del permiso.')
      return
    }
    if (!rifValid(data.rif)) {
      permisoFeedback.innerHTML = createAlert('warning', 'RIF invalido. Usa formato J-12345678-9.')
      return
    }
    if (!emailValid(data.email) || !phoneValid(data.telefono)) {
      permisoFeedback.innerHTML = createAlert('warning', 'Correo o telefono invalido.')
      return
    }
    if ((data.descripcionProceso || '').trim().length < 50) {
      permisoFeedback.innerHTML = createAlert('warning', 'La descripcion del proceso debe tener minimo 50 caracteres.')
      return
    }

    const code = genCode('PERM', state.permisos.length)
    state.permisos.unshift({
      code,
      doc: data.rif.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      ...data,
    })
    saveState(state)
    refreshKpis()
    permisoFeedback.innerHTML = createAlert('success', `Solicitud registrada. Codigo de seguimiento: <strong>${code}</strong>`)
    permisoForm.reset()
  })

  const licenciaForm = document.getElementById('licenciaForm')
  const licenciaFeedback = document.getElementById('licenciaFeedback')
  licenciaForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = asObject(licenciaForm)
    if (!data.tipoLicencia || !data.empresa || !data.rif || !data.representanteLegal || !data.email) {
      licenciaFeedback.innerHTML = createAlert('danger', 'Completa los datos obligatorios de la licencia.')
      return
    }
    if (!rifValid(data.rif)) {
      licenciaFeedback.innerHTML = createAlert('warning', 'RIF invalido. Usa formato J-12345678-9.')
      return
    }
    if (!emailValid(data.email)) {
      licenciaFeedback.innerHTML = createAlert('warning', 'Correo invalido.')
      return
    }
    if ((data.descripcion || '').trim().length < 50) {
      licenciaFeedback.innerHTML = createAlert('warning', 'La descripcion del proyecto debe tener minimo 50 caracteres.')
      return
    }
    if (!document.getElementById('aceptaTerminos')?.checked) {
      licenciaFeedback.innerHTML = createAlert('warning', 'Debes aceptar terminos y condiciones.')
      return
    }

    const code = genCode('LIC', state.licencias.length)
    state.licencias.unshift({
      code,
      doc: data.rif.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'pendiente',
      ...data,
    })
    saveState(state)
    refreshKpis()
    licenciaFeedback.innerHTML = createAlert('success', `Solicitud enviada. Codigo de seguimiento: <strong>${code}</strong>`)
    licenciaForm.reset()
  })

  const lookupForm = document.getElementById('lookupForm')
  const lookupResult = document.getElementById('lookupResult')
  lookupForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    const code = (document.getElementById('lookupCode')?.value || '').trim().toUpperCase()
    const doc = (document.getElementById('lookupDoc')?.value || '').trim().toUpperCase()
    const all = [...state.denuncias, ...state.permisos, ...state.licencias]
    const item = all.find((x) => x.code === code && x.doc === doc)
    if (!item) {
      lookupResult.innerHTML = createAlert('danger', 'No se encontro tramite con ese codigo y documento.')
      return
    }
    const created = new Date(item.createdAt).toLocaleString('es-VE')
    const type = item.code.startsWith('DEN-') ? 'Denuncia' : item.code.startsWith('PERM-') ? 'Permiso' : 'Licencia'
    lookupResult.innerHTML = createAlert(
      'success',
      `Tramite encontrado: <strong>${item.code}</strong> (${type})<br>Estado: <strong>${item.status}</strong><br>Fecha: ${created}`,
    )
  })
})()
