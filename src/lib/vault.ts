import { openJson, type SealedVault } from './vaultCrypto.js'
import type { VaultPayload } from '../types'

export { cryptoAvailable } from './vaultCrypto.js'

/** Resolves to the decrypted vault, or null for a wrong phrase. Throws on network errors. */
export async function unlockVault(vaultId: string, phrase: string): Promise<VaultPayload | null> {
  const res = await fetch(`${import.meta.env.BASE_URL}vault/${encodeURIComponent(vaultId)}.json`, {
    cache: 'no-cache',
  })
  if (!res.ok) throw new Error(`vault ${vaultId}: HTTP ${res.status}`)
  const sealed = (await res.json()) as SealedVault
  return openJson<VaultPayload>(sealed, phrase)
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
