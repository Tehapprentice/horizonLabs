/** A segmented bar like [■■■□□□□□□□]. */
export function Cells({ total, filled }: { total: number; filled: number }) {
  return (
    <span className="cells" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < filled ? '' : 'off'} />
      ))}
    </span>
  )
}
