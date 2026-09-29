import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface CrtState {
  effects: boolean
  brownout: boolean
}

const CrtContext = createContext<CrtState>({ effects: true, brownout: false })
export const useCrt = () => useContext(CrtContext)

const BROWNOUT_MS = 520
const ALARM_MS = 900
const ALARM_EVENT = 'crt:alarm'

/** Flash the whole screen red once (wrong password, etc). */
export function triggerAlarm() {
  window.dispatchEvent(new Event(ALARM_EVENT))
}

/**
 * The monitor: scanlines, phosphor noise, a rolling refresh bar, vignette,
 * and random "brownouts" where the failing generator dips the screen.
 */
export function Crt({ effects, children }: { effects: boolean; children: ReactNode }) {
  const [brownout, setBrownout] = useState(false)
  const [alarm, setAlarm] = useState(0)

  useEffect(() => {
    if (!effects) {
      setBrownout(false)
      return
    }
    let next = 0
    let end = 0
    const schedule = () => {
      next = window.setTimeout(
        () => {
          setBrownout(true)
          end = window.setTimeout(() => {
            setBrownout(false)
            schedule()
          }, BROWNOUT_MS)
        },
        7000 + Math.random() * 18000,
      )
    }
    schedule()
    return () => {
      clearTimeout(next)
      clearTimeout(end)
    }
  }, [effects])

  useEffect(() => {
    let timer = 0
    const onAlarm = () => {
      setAlarm((n) => n + 1)
      clearTimeout(timer)
      timer = window.setTimeout(() => setAlarm(0), ALARM_MS)
    }
    window.addEventListener(ALARM_EVENT, onAlarm)
    return () => {
      window.removeEventListener(ALARM_EVENT, onAlarm)
      clearTimeout(timer)
    }
  }, [])

  const className = ['crt', effects && 'fx', brownout && 'brownout', alarm > 0 && `alarm alarm-${alarm % 2}`]
    .filter(Boolean)
    .join(' ')

  return (
    <CrtContext.Provider value={{ effects, brownout }}>
      <div className={className}>
        {children}
        <div className="overlay scanlines" aria-hidden />
        <div className="overlay rollbar" aria-hidden />
        <div className="overlay dimmer" aria-hidden />
        <div className="overlay alarm-tint" aria-hidden />
        <div className="bezel" aria-hidden />
      </div>
    </CrtContext.Provider>
  )
}
