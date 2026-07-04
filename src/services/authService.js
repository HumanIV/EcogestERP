import { api } from './api'

async function login(email, password) {
  try {
    const data = await api('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function register(userData) {
  try {
    const data = await api('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function getProfile(token) {
  try {
    const data = await api('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const authService = { login, register, getProfile }
