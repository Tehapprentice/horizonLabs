// Shared by the browser app and the Node sealing script (scripts/seal.mjs).
// Uses only the Web Crypto API, which exists in modern browsers and Node 18+.
//
// A "vault" is a JSON payload encrypted with AES-256-GCM. The key is derived
// from the passphrase with PBKDF2-SHA256. A wrong passphrase makes decryption
// fail, so no passphrase or hash is ever stored in the site.

const ITERATIONS = 250_000
const encoder = new TextEncoder()
const decoder = new TextDecoder()

/** Case and spaces don't matter: "For Good of All" == "forgoodofall" == "FORGOODOFALL". */
export function normalizePhrase(phrase) {
  return String(phrase).normalize('NFKC').replace(/\s+/g, '').toUpperCase()
}

export function cryptoAvailable() {
  return typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.subtle !== 'undefined'
}

function toBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(b64) {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

async function deriveKey(phrase, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', encoder.encode(normalizePhrase(phrase)), 'PBKDF2', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function sealJson(value, phrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(phrase, salt, ITERATIONS)
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(value)))
  return {
    v: 1,
    kdf: 'PBKDF2-SHA256',
    iter: ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(data)),
  }
}

/** Returns the decrypted payload, or null if the passphrase is wrong. */
export async function openJson(sealed, phrase) {
  try {
    const key = await deriveKey(phrase, fromBase64(sealed.salt), sealed.iter)
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(sealed.iv) }, key, fromBase64(sealed.data))
    return JSON.parse(decoder.decode(plain))
  } catch {
    return null
  }
}
