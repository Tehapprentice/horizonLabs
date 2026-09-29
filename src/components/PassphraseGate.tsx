import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { cryptoAvailable, sleep, unlockVault } from '../lib/vault'
import type { VaultPayload } from '../types'
import { triggerAlarm } from './Crt'

type GateState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'granted' }
  | { kind: 'denied'; text: string }
  | { kind: 'error'; text: string }

interface Props {
  vaultId: string
  prompt: string
  deniedMessages: string[]
  hint?: { after: number; text: string }
  onUnlocked: (payload: VaultPayload, phrase: string) => void
}

/** A terminal-style input that unlocks one encrypted vault. */
export function PassphraseGate({ vaultId, prompt, deniedMessages, hint, onUnlocked }: Props) {
  const [value, setValue] = useState('')
  const [state, setState] = useState<GateState>({ kind: 'idle' })
  const [attempts, setAttempts] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const busy = state.kind === 'checking' || state.kind === 'granted'
  const alert = state.kind === 'denied' || state.kind === 'error'

  useEffect(() => {
    if (!busy) inputRef.current?.focus({ preventScroll: true })
  }, [busy])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const phrase = value
    if (busy || !phrase.trim()) return
    if (!cryptoAvailable()) {
      setState({ kind: 'error', text: 'SECURE CHANNEL UNAVAILABLE. THIS TERMINAL MUST BE OPENED OVER HTTPS.' })
      return
    }
    setState({ kind: 'checking' })
    try {
      const [payload] = await Promise.all([unlockVault(vaultId, phrase), sleep(1100)])
      if (payload) {
        setState({ kind: 'granted' })
        await sleep(1400)
        onUnlocked(payload, phrase)
        return
      }
      const n = attempts + 1
      setAttempts(n)
      setValue('')
      setState({ kind: 'denied', text: deniedMessages[(n - 1) % deniedMessages.length] })
      triggerAlarm()
    } catch {
      setState({ kind: 'error', text: 'ARCHIVE SERVER NOT RESPONDING. CHECK YOUR CONNECTION AND RETRY.' })
    }
  }

  return (
    <form
      className={['gate', alert && 'alert-mode', attempts > 0 && alert && `shake-${attempts % 2}`]
        .filter(Boolean)
        .join(' ')}
      onSubmit={submit}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      noValidate
    >
      <label htmlFor={inputId} className="gate-prompt">
        {prompt}
      </label>
      <div className="terminal-input">
        <span className="ti-prefix" aria-hidden>
          &gt;
        </span>
        <span className="ti-mirror" aria-hidden>
          {value}
        </span>
        {!busy && <span className="cursor" aria-hidden />}
        <input
          id={inputId}
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (alert) setState({ kind: 'idle' })
          }}
          disabled={busy}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={120}
        />
      </div>
      <div className="gate-actions">
        <button type="submit" className="btn" disabled={busy || !value.trim()}>
          [ TRANSMIT ]
        </button>
      </div>
      <div className="gate-status" role="status" aria-live="polite">
        {state.kind === 'checking' && (
          <p>
            VERIFYING CREDENTIALS<span className="dots" aria-hidden />
          </p>
        )}
        {state.kind === 'granted' && <p className="granted">ACCESS GRANTED</p>}
        {alert && <p>{state.text}</p>}
        {hint && attempts >= hint.after && state.kind !== 'granted' && <p className="dim">{hint.text}</p>}
      </div>
    </form>
  )
}
