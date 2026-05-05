import type { Category } from '../types'

export default function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: Category[]
  value: string | null
  onChange: (id: string | null) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-neutral-500">카테고리</span>
      <div className="flex flex-wrap gap-1.5">
        <Chip
          selected={value === null}
          onClick={() => onChange(null)}
          label="없음"
        />
        {categories.map((c) => (
          <Chip
            key={c.id}
            selected={value === c.id}
            onClick={() => onChange(c.id)}
            label={c.name}
            color={c.color ?? undefined}
          />
        ))}
      </div>
    </div>
  )
}

function Chip({
  selected,
  onClick,
  label,
  color,
}: {
  selected: boolean
  onClick: () => void
  label: string
  color?: string
}) {
  if (selected) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white"
      >
        {color && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700 active:bg-neutral-200"
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </button>
  )
}
