const COLORS = [
  '#3b82f6',
  '#a855f7',
  '#10b981',
  '#ef4444',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#737373',
] as const

export default function ColorPalette({
  value,
  onChange,
}: {
  value: string | null
  onChange: (next: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-neutral-500">색</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="색 없음"
          className={
            value === null
              ? 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-xs text-neutral-400'
              : 'flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-xs text-neutral-400'
          }
        >
          ✕
        </button>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`색 ${c}`}
            className={
              value === c
                ? 'h-8 w-8 rounded-full ring-2 ring-blue-500 ring-offset-2'
                : 'h-8 w-8 rounded-full'
            }
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )
}
