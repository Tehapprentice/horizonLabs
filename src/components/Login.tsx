import { LOGIN_DENIED, LOGIN_HINT, LOGO, SHELL } from '../config'
import type { VaultPayload } from '../types'
import { PassphraseGate } from './PassphraseGate'

export function Login({ onUnlocked }: { onUnlocked: (payload: VaultPayload, phrase: string) => void }) {
  return (
    <section className="login power-on">
      <pre className="logo" role="img" aria-label={SHELL.corp}>
        {LOGO}
      </pre>
      <p className="logo-sub">{SHELL.corpSub}</p>
      <div className="login-meta">
        <p>{SHELL.archiveName}</p>
        <p className="dim">{SHELL.facility}</p>
        <p className="alert">AUTHORIZED PERSONNEL ONLY</p>
      </div>
      <PassphraseGate
        vaultId="main"
        prompt="ENTER AUTHORIZATION PHRASE:"
        deniedMessages={LOGIN_DENIED}
        hint={LOGIN_HINT}
        onUnlocked={onUnlocked}
      />
    </section>
  )
}
