import { useEffect } from 'react'
import { OVERRIDE_DENIED } from '../config'
import type { LockedSection, VaultPayload } from '../types'
import { PassphraseGate } from './PassphraseGate'

interface Props {
  section: LockedSection
  onBack: () => void
  onUnlocked: (payload: VaultPayload, phrase: string) => void
}

export function LockScreen({ section, onBack, onUnlocked }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <section className="lock power-on">
      <a className="btn back" href="#/">
        [ ESC ] ABORT
      </a>
      <h1 className="lock-title alert">SECURITY OVERRIDE</h1>
      <p>TARGET: A:\ARCHIVE\{section.label}</p>
      {section.hint && <p className="dim">{section.hint}</p>}
      <PassphraseGate
        vaultId={section.id}
        prompt="ENTER OVERRIDE CODE:"
        deniedMessages={OVERRIDE_DENIED}
        onUnlocked={onUnlocked}
      />
    </section>
  )
}
