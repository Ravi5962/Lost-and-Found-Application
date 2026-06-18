const LS_USERS_KEY = 'lf_users'
const LS_SESSION_KEY = 'lf_session'

export function readUsers() {
  try {
    const raw = window.localStorage.getItem(LS_USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeUsers(users) {
  window.localStorage.setItem(LS_USERS_KEY, JSON.stringify(users))
}

export function getSession() {
  try {
    const raw = window.localStorage.getItem(LS_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.username || !parsed.role) return null
    return parsed
  } catch {
    return null
  }
}

export function setSession(session) {
  if (!session) {
    window.localStorage.removeItem(LS_SESSION_KEY)
    return
  }
  window.localStorage.setItem(LS_SESSION_KEY, JSON.stringify(session))
}

export function hashPassword(pw) {
  // Frontend-only demo: do NOT use real password hashing on client.
  // This is just to avoid storing the plain password in localStorage.
  try {
    return btoa(unescape(encodeURIComponent(pw)))
  } catch {
    return pw
  }
}

export function validateUsername(username) {
  const u = (username || '').trim()
  if (u.length < 3) return 'Username must be at least 3 characters.'
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Username can use letters, numbers, and underscore only.'
  return null
}

export function validatePassword(password) {
  const p = password || ''
  if (p.length < 6) return 'Password must be at least 6 characters.'
  return null
}

