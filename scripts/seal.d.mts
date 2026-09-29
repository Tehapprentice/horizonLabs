export function sealAll(options?: {
  root?: string
  log?: (message: string) => void
}): Promise<{ skipped: boolean; changed: string[] }>
