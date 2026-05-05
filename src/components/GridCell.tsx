import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MapNode } from '../types'
import ChildDots from './ChildDots'

export default function GridCell({
  spaceId,
  node,
  isContainer,
  isArmed,
  onArm,
  onCreate,
  onEdit,
}: {
  spaceId: string
  node: MapNode | null
  isContainer: boolean
  isArmed: boolean
  onArm: () => void
  onCreate: () => void
  onEdit: () => void
}) {
  if (node === null) {
    if (isArmed) {
      return (
        <button
          type="button"
          onClick={onCreate}
          aria-label="새 항목 추가"
          className="flex aspect-square items-center justify-center rounded-md border-2 border-blue-500 bg-blue-50 text-blue-600 active:bg-blue-100"
        >
          <Plus className="h-5 w-5" />
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={onArm}
        aria-label="빈 셀"
        className="aspect-square rounded-md border-2 border-dashed border-neutral-200 active:bg-neutral-100"
      />
    )
  }

  const tint = node.color ? `${node.color}1a` : '#ffffff'
  const border = node.color ?? '#e5e5e5'
  const baseClasses =
    'relative flex aspect-square flex-col overflow-hidden rounded-md border p-1.5 text-left active:scale-[0.98]'
  const label = (
    <span className="line-clamp-2 text-[11px] leading-tight font-medium text-neutral-800">
      {node.name}
    </span>
  )

  if (isContainer) {
    return (
      <Link
        to={`/s/${spaceId}/n/${node.id}`}
        className={baseClasses}
        style={{ backgroundColor: tint, borderColor: border }}
      >
        {label}
        <ChildDots />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      className={baseClasses}
      style={{ backgroundColor: tint, borderColor: border }}
    >
      {label}
    </button>
  )
}
