import { useCallback, useEffect, useRef, useState } from 'react'
import { BOOT_LINES, type BootLine } from '../config'
import { Cells } from './Cells'

const STATUS_TEXT = { ok: ' OK ', fail: 'FAIL', warn: 'WARN' } as const
const BAR_CELLS = 20

interface Props {
  /** Returning visitors get a fast boot. */
  quick: boolean
  onDone: () => void
}

export function BootSequence({ quick, onDone }: Props) {
  // Lines 0..current are visible; `current` is the one still "running".
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const speed = quick ? 0.25 : 1

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDoneRef.current()
  }, [])

  useEffect(() => {
    if (current >= BOOT_LINES.length) {
      const t = setTimeout(finish, 900 * speed)
      return () => clearTimeout(t)
    }
    const line = BOOT_LINES[current]
    if (line.kind === 'progress') {
      let step = 0
      setProgress(0)
      const id = setInterval(
        () => {
          step++
          setProgress(step / BAR_CELLS)
          if (step >= BAR_CELLS) {
            clearInterval(id)
            setCurrent((c) => c + 1)
          }
        },
        (line.duration * speed) / BAR_CELLS,
      )
      return () => clearInterval(id)
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), (line.pause ?? 120) * speed)
    return () => clearTimeout(t)
  }, [current, speed, finish])

  useEffect(() => {
    window.addEventListener('keydown', finish)
    window.addEventListener('pointerdown', finish)
    return () => {
      window.removeEventListener('keydown', finish)
      window.removeEventListener('pointerdown', finish)
    }
  }, [finish])

  const visible = BOOT_LINES.slice(0, current + 1)

  return (
    <section className="boot" aria-label="System boot sequence">
      {visible.map((line, i) => (
        <BootRow key={i} line={line} progress={i < current ? 1 : progress} />
      ))}
      <span className="cursor" aria-hidden />
      <p className="boot-skip">[ PRESS ANY KEY OR TAP TO SKIP ]</p>
    </section>
  )
}

function BootRow({ line, progress }: { line: BootLine; progress: number }) {
  switch (line.kind) {
    case 'blank':
      return <div aria-hidden>&nbsp;</div>
    case 'text':
      return <div className={line.tone ?? ''}>{line.text}</div>
    case 'banner':
      return <div className="boot-banner">{line.text}</div>
    case 'check':
      return (
        <div className="boot-check">
          <span>{line.label}</span>
          <span className="leader" aria-hidden />
          <span className={`status-${line.status}`}>[{line.statusText ?? STATUS_TEXT[line.status]}]</span>
        </div>
      )
    case 'progress': {
      const filled = Math.round(progress * BAR_CELLS)
      return (
        <div className="boot-progress">
          <span>{line.label} </span>
          <Cells total={BAR_CELLS} filled={filled} /> <span>{Math.round(progress * 100)}%</span>
        </div>
      )
    }
  }
}
