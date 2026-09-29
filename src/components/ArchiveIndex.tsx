import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { LockedSection, VaultDoc, Vaults } from '../types'
import { Typewriter } from './Typewriter'

// Directories only play their reveal animation the first time they appear.
const seen = new Set<string>()
export function resetIndexAnimations() {
  seen.clear()
}

export function ArchiveIndex({ vaults }: { vaults: Vaults }) {
  const main = vaults.main
  const ref = useRef<HTMLElement>(null)
  const [firstVisit] = useState(() => !seen.has('main'))
  const total = Object.values(vaults).reduce((n, v) => n + v.docs.length, 0)

  // Arrow keys move between files, like an old menu system.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-nav]') ?? [])
      if (!items.length) return
      e.preventDefault()
      const i = items.indexOf(document.activeElement as HTMLElement)
      const next =
        e.key === 'ArrowDown' ? (i + 1) % items.length : i <= 0 ? items.length - 1 : i - 1
      items[next].focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className={`archive ${firstVisit ? 'power-on' : ''}`} ref={ref}>
      <Typewriter
        className="greeting"
        text={main.greeting ?? 'ACCESS GRANTED. WELCOME, SURVIVOR.'}
        instant={!firstVisit}
      />
      <p className="dim">
        RECOVERED FILES: {total} // UNREADABLE SECTORS: 14,208
      </p>
      <Directory vaultId="main" title={main.title} docs={main.docs} />
      {main.locked?.map((section) =>
        vaults[section.id] ? (
          <Directory
            key={section.id}
            vaultId={section.id}
            title={vaults[section.id].title}
            docs={vaults[section.id].docs}
            decrypted
          />
        ) : (
          <LockedDirectory key={section.id} section={section} />
        ),
      )}
    </section>
  )
}

function Directory({
  vaultId,
  title,
  docs,
  decrypted = false,
}: {
  vaultId: string
  title: string
  docs: VaultDoc[]
  decrypted?: boolean
}) {
  const [animate] = useState(() => !seen.has(vaultId))
  useEffect(() => {
    seen.add(vaultId)
  }, [vaultId])

  return (
    <div className={`dir ${animate ? 'animate' : ''}`}>
      <div className="dir-head">
        DIRECTORY OF A:\ARCHIVE\{title}
        {decrypted && <span className="amber"> [DECRYPTED]</span>}
      </div>
      <ul className="dir-list">
        {docs.map((doc, i) => (
          <li key={doc.slug} style={{ '--i': i } as CSSProperties}>
            <a
              data-nav
              className={`dir-row ${doc.priority ? 'priority' : ''} ${doc.theme ? `theme-${doc.theme}` : ''}`}
              href={`#/doc/${vaultId}/${encodeURIComponent(doc.slug)}`}
            >
              <span className="dir-idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="dir-file">
                {doc.priority && '!! '}
                {doc.file}
              </span>
              {doc.classification && <span className="dir-class">{doc.classification}</span>}
            </a>
          </li>
        ))}
      </ul>
      <div className="dir-foot dim">
        {docs.length} FILE(S){docs.length === 0 && ' // NO RECOVERABLE DATA'}
      </div>
    </div>
  )
}

function LockedDirectory({ section }: { section: LockedSection }) {
  return (
    <div className="dir locked">
      <div className="dir-head">
        DIRECTORY OF A:\ARCHIVE\{section.label} <span className="alert">[LOCKED]</span>
      </div>
      <p className="redaction-bar" aria-hidden>
        ████████ ██ ██████████ ███████ ████ ██████
      </p>
      <p className="alert">{section.hint ?? 'ACCESS RESTRICTED.'}</p>
      <a data-nav className="btn" href={`#/lock/${encodeURIComponent(section.id)}`}>
        [ ENTER OVERRIDE CODE ]
      </a>
    </div>
  )
}
