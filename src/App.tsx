import { useCallback, useEffect, useState } from 'react'
import { ArchiveIndex, resetIndexAnimations } from './components/ArchiveIndex'
import { BootSequence } from './components/BootSequence'
import { Crt } from './components/Crt'
import { DocumentView } from './components/DocumentView'
import { LockScreen } from './components/LockScreen'
import { Login } from './components/Login'
import { StatusBar } from './components/StatusBar'
import { forgetAllKeys, forgetKey, loadKeys, loadPrefs, rememberKey, savePrefs } from './lib/storage'
import { unlockVault } from './lib/vault'
import { useHashRoute } from './lib/useHashRoute'
import type { VaultPayload, Vaults } from './types'

export default function App() {
  const [prefs, setPrefs] = useState(loadPrefs)
  const [vaults, setVaults] = useState<Vaults>({})
  const [returning] = useState(() => Boolean(loadKeys().main))
  const [bootDone, setBootDone] = useState(false)
  const [restored, setRestored] = useState(false)
  const [route, navigate] = useHashRoute()

  // Re-open any vaults this device unlocked before, while the boot screen plays.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const opened: Vaults = {}
      await Promise.all(
        Object.entries(loadKeys()).map(async ([id, phrase]) => {
          try {
            const payload = await unlockVault(id, phrase)
            if (payload) opened[id] = payload
            else forgetKey(id) // passphrase was changed since
          } catch {
            // offline or insecure context: fall back to the login screen
          }
        }),
      )
      if (!cancelled) {
        setVaults(opened)
        setRestored(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const phase = !bootDone || !restored ? 'boot' : vaults.main ? 'ready' : 'login'
  const routeKey = route.join('/')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [routeKey, phase])

  const onBootDone = useCallback(() => setBootDone(true), [])
  const goHome = useCallback(() => navigate('/'), [navigate])

  const unlock = useCallback((vaultId: string, payload: VaultPayload, phrase: string) => {
    rememberKey(vaultId, phrase)
    setVaults((v) => ({ ...v, [vaultId]: payload }))
  }, [])

  const logout = () => {
    forgetAllKeys()
    resetIndexAnimations()
    setVaults({})
    navigate('/')
  }

  const toggleEffects = () =>
    setPrefs((p) => {
      const next = { ...p, effects: !p.effects }
      savePrefs(next)
      return next
    })

  function renderReady() {
    const [section, a, b] = route
    if (section === 'doc' && a && b) {
      const doc = vaults[a]?.docs.find((d) => d.slug === b)
      return doc ? <DocumentView key={`${a}/${b}`} doc={doc} onBack={goHome} /> : <NotFound />
    }
    if (section === 'lock' && a && !vaults[a]) {
      const locked = vaults.main.locked?.find((l) => l.id === a)
      if (locked) {
        return (
          <LockScreen
            key={a}
            section={locked}
            onBack={goHome}
            onUnlocked={(payload, phrase) => {
              unlock(a, payload, phrase)
              goHome()
            }}
          />
        )
      }
    }
    return <ArchiveIndex vaults={vaults} />
  }

  return (
    <Crt effects={prefs.effects}>
      <div className="screen">
        {phase !== 'boot' && <StatusBar />}
        <main className="content">
          {phase === 'boot' && <BootSequence quick={returning} onDone={onBootDone} />}
          {phase === 'login' && <Login onUnlocked={(payload, phrase) => unlock('main', payload, phrase)} />}
          {phase === 'ready' && renderReady()}
        </main>
        {phase !== 'boot' && (
          <footer className="controls">
            <button
              type="button"
              className="btn"
              onClick={toggleEffects}
              aria-pressed={!prefs.effects}
              title="Turns off flicker and motion effects"
            >
              [ POWER STABILIZER: {prefs.effects ? 'OFF' : 'ON'} ]
            </button>
            {phase === 'ready' && (
              <button type="button" className="btn" onClick={logout}>
                [ TERMINATE SESSION ]
              </button>
            )}
          </footer>
        )}
      </div>
    </Crt>
  )
}

function NotFound() {
  return (
    <section className="notfound alert-mode">
      <p>ERROR 0x31: FILE NOT FOUND OR SECTOR CORRUPTED.</p>
      <a className="btn" href="#/">
        [ RETURN TO DIRECTORY ]
      </a>
    </section>
  )
}
