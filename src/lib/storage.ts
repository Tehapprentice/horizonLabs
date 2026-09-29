// Guests will reopen the site to check the address, so remember unlocked
// phrases on their device. All access is wrapped: storage can be blocked.

const KEYS = 'halcyon.keys.v1'
const PREFS = 'halcyon.prefs.v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable; the session still works, it just won't be remembered
  }
}

export function loadKeys(): Record<string, string> {
  return read<Record<string, string>>(KEYS, {})
}

export function rememberKey(vaultId: string, phrase: string) {
  write(KEYS, { ...loadKeys(), [vaultId]: phrase })
}

export function forgetKey(vaultId: string) {
  const keys = loadKeys()
  delete keys[vaultId]
  write(KEYS, keys)
}

export function forgetAllKeys() {
  try {
    localStorage.removeItem(KEYS)
  } catch {
    // ignore
  }
}

export interface Prefs {
  effects: boolean
}

export function loadPrefs(): Prefs {
  let reduceMotion = false
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    // ignore
  }
  return read<Prefs>(PREFS, { effects: !reduceMotion })
}

export function savePrefs(prefs: Prefs) {
  write(PREFS, prefs)
}
