import { useEffect, useState } from 'react'
import { SHELL, TICKER } from '../config'
import { Cells } from './Cells'
import { useCrt } from './Crt'

const CELLS = 10

export function StatusBar() {
  const { brownout } = useCrt()
  const [power, setPower] = useState(23)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
      setPower((p) => Math.min(31, Math.max(12, p + Math.round(Math.random() * 4 - 2))))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const shown = brownout ? 3 : power
  const filled = Math.max(1, Math.ceil((shown / 100) * CELLS))
  const time = now.toLocaleTimeString('en-GB', { hour12: false })

  return (
    <header className="status-bar">
      <div className="status-row">
        <span>
          {SHELL.corp} // {SHELL.terminal}
        </span>
        <span className={brownout ? 'alert' : 'amber'}>
          AUX PWR <Cells total={CELLS} filled={filled} />{' '}
          {String(shown).padStart(2, '0')}%{brownout && ' !! VOLTAGE DROP'}
        </span>
        <span className="dim">SYS {time}</span>
      </div>
      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          {TICKER}
          {TICKER}
        </div>
      </div>
    </header>
  )
}
