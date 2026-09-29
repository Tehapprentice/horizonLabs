export interface VaultDoc {
  slug: string
  file: string
  title: string
  classification?: string
  date?: string
  author?: string
  priority?: boolean
  /** Optional color scheme, applied as a `theme-<name>` class (see styles.css). */
  theme?: string
  html: string
}

export interface LockedSection {
  id: string
  label: string
  hint: string | null
}

export interface VaultPayload {
  id: string
  title: string
  greeting?: string
  docs: VaultDoc[]
  /** Only present on the main vault: the sections that need an override code. */
  locked?: LockedSection[]
}

export type Vaults = Record<string, VaultPayload>
