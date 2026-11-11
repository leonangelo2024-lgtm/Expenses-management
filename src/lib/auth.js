// Local accounts, stored in this browser only. Passwords are never stored:
// only a salted PBKDF2 hash. This keeps casual users of the same browser
// out, but it is not server-side security — anyone with access to the
// browser's storage can still read the saved data.

const USERS_KEY = 'expenses.users.v1'
const SESSION_KEY = 'expenses.session.v1'
// Data saved before accounts existed; handed to the first account created.
const LEGACY_KEYS = ['expenses.v1', 'expenses.settings.v1']

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)))

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 310000 },
    key,
    256,
  )
  return toHex(bits)
}

// Usernames are case-insensitive; the id is the lowercase form.
const toId = (username) => username.trim().toLowerCase()

export function hasAccounts() {
  return Object.keys(read(USERS_KEY, {})).length > 0
}

export function displayName(id) {
  return read(USERS_KEY, {})[id]?.name ?? id
}

// Storage key for one user's copy of a piece of data.
export function userKey(id, name) {
  return `${name}:${id}`
}

function adoptLegacyData(id) {
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null && localStorage.getItem(userKey(id, key)) === null) {
        localStorage.setItem(userKey(id, key), raw)
        localStorage.removeItem(key)
      }
    } catch {
      // Leave legacy data where it is; nothing is lost.
    }
  }
}

export async function createAccount(username, password) {
  const id = toId(username)
  const users = read(USERS_KEY, {})
  if (users[id]) throw new Error('That username is already taken.')
  const first = Object.keys(users).length === 0
  const salt = crypto.getRandomValues(new Uint8Array(16))
  users[id] = { name: username.trim(), salt: toHex(salt), hash: await hashPassword(password, salt) }
  if (!write(USERS_KEY, users)) throw new Error("Couldn't save the account in this browser.")
  if (first) adoptLegacyData(id)
  return id
}

export async function signIn(username, password) {
  const user = read(USERS_KEY, {})[toId(username)]
  if (!user || (await hashPassword(password, fromHex(user.salt))) !== user.hash) {
    throw new Error('Wrong username or password.')
  }
  return toId(username)
}

export function getSession() {
  const id = read(SESSION_KEY, null)
  return id && read(USERS_KEY, {})[id] ? id : null
}

export function setSession(id) {
  write(SESSION_KEY, id)
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignore; the in-memory state still signs the user out.
  }
}
