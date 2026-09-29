import { useCallback, useEffect, useState } from 'react'

/** Tiny hash router: "#/doc/main/incident-log" → ["doc", "main", "incident-log"]. */
export function useHashRoute(): [string[], (path: string) => void] {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((path: string) => {
    window.location.hash = path.startsWith('/') ? path : `/${path}`
  }, [])

  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((p) => {
      try {
        return decodeURIComponent(p)
      } catch {
        return p
      }
    })

  return [parts, navigate]
}
