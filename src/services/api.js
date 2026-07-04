const API_URL = 'https://ecogestbackend.onrender.com'

async function api(path, options = {}) {
  const token = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('usuarioActual') || '{}')
      return u.accessToken || null
    } catch {
      return null
    }
  })()

  const baseHeaders = { 'Content-Type': 'application/json' }
  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.headers || {}),
    },
  })

  if (res.status === 401) {
    const event = new CustomEvent('auth:logout')
    window.dispatchEvent(event)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `${res.status} ${res.statusText}`)
  }
  return res.json()
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('usuarioActual') || '{}')
  } catch {
    return {}
  }
}

export { API_URL, api, getCurrentUser }
