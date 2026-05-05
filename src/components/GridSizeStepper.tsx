import { Minus, Plus } from 'lucide-react'

export default function GridSizeStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (next: number) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white px-1 py-0.5">
      <span className="px-1.5 text-xs text-neutral-500">{label}</span>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`${label} 줄이기`}
        className="flex h-8 w-8 items-center justify-center rounded text-neutral-700 active:bg-neutral-100 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`${label} 늘리기`}
        className="flex h-8 w-8 items-center justify-center rounded text-neutral-700 active:bg-neutral-100 disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
