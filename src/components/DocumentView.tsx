import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { VaultDoc } from '../types'
import { useCrt } from './Crt'

export function DocumentView({ doc, onBack }: { doc: VaultDoc; onBack: () => void }) {
  const { effects } = useCrt()
  const [loading, setLoading] = useState(effects)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!effects) return setLoading(false)
    const t = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(t)
  }, [effects])

  // Number each block, then switch on the reveal, so CSS shows them one after another.
  // (The animation must not start before the delays exist, or elements can stick at opacity 0.)
  useLayoutEffect(() => {
    const body = bodyRef.current
    if (loading || !body) return
    Array.from(body.children).forEach((child, i) => {
      ;(child as HTMLElement).style.setProperty('--i', String(Math.min(i, 30)))
    })
    body.classList.add('reveal')
  }, [loading, doc])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  const theme = doc.theme ? `theme-${doc.theme}` : ''

  if (loading) {
    return (
      <div className={`retrieving ${theme}`} role="status">
        <p>RETRIEVING {doc.file}</p>
        <div className="loadbar">
          <span />
        </div>
      </div>
    )
  }

  const meta: [string, string | undefined][] = [
    ['FILE', doc.file],
    ['CLASS', doc.classification],
    ['DATE', doc.date],
    ['AUTHOR', doc.author],
  ]

  return (
    <article className={`doc ${theme}`}>
      <a className="btn back" href="#/">
        [ ESC ] RETURN TO DIRECTORY
      </a>
      <dl className="doc-meta">
        {meta
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k}:</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>
      <h1 className="doc-title">{doc.title}</h1>
      <div className="doc-body" ref={bodyRef} dangerouslySetInnerHTML={{ __html: doc.html }} />
      <p className="doc-end dim">-- END OF FILE --</p>
      <a className="btn back" href="#/">
        [ ESC ] RETURN TO DIRECTORY
      </a>
    </article>
  )
}
