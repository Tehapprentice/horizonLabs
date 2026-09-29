export interface SealedVault {
  v: number
  kdf: string
  iter: number
  salt: string
  iv: string
  data: string
}

export function normalizePhrase(phrase: string): string
export function cryptoAvailable(): boolean
export function sealJson(value: unknown, phrase: string): Promise<SealedVault>
export function openJson<T = unknown>(sealed: SealedVault, phrase: string): Promise<T | null>
