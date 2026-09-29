import { useEffect, useState } from 'react'
import { useCrt } from './Crt'

interface Props {
  text: string
  className?: string
  speed?: number
  instant?: boolean
}

export function Typewriter({ text, className, speed = 32, instant = false }: Props) {
  const { effects } = useCrt()
  const skip = instant || !effects
  const [count, setCount] = useState(skip ? text.length : 0)

  useEffect(() => {
    if (skip) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setCount(i)
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, skip, speed])

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, count)}
        {count < text.length && <span className="cursor" />}
      </span>
    </p>
  )
}
