import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MapNode, Position } from '../types'
import ChildDots from './ChildDots'

export default function GridCell({
  spaceId,
  node,
  position,
  isContainer,
  isArmed,
  highlighted,
  onArm,
  onCreate,
  onEdit,
}: {
  spaceId: string
  node: MapNode | null
  position: Position
  isContainer: boolean
  isArmed: boolean
  highlighted: boolean
  onArm: () => void
  onCreate: () => void
  onEdit: () => void
}) {
  const placement: React.CSSProperties = node
    ? {
        gridColumn: `${node.position.x + 1} / span ${node.size.width}`,
        gridRow: `${node.position.y + 1} / span ${node.size.height}`,
      }
    : {
        gridColumn: `${position.x + 1} / span 1`,
        gridRow: `${position.y + 1} / span 1`,
      }

  if (node === null) {
    if (isArmed) {
      return (
        <button
          type="button"
          onClick={onCreate}
          aria-label="새 항목 추가"
          style={placement}
          className="flex min-h-0 items-center justify-center rounded-md border-2 border-blue-500 bg-blue-50 text-blue-600 active:bg-blue-100"
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
        style={placement}
        className="min-h-0 rounded-md border-2 border-dashed border-neutral-200 active:bg-neutral-100"
      />
    )
  }

  const tint = node.color ? `${node.color}1a` : '#ffffff'
  const border = node.color ?? '#e5e5e5'
  const baseClasses = `relative flex min-h-0 flex-col overflow-hidden rounded-md border p-1.5 text-left active:scale-[0.98] ${highlighted ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`
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
        style={{ ...placement, backgroundColor: tint, borderColor: border }}
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
      style={{ ...placement, backgroundColor: tint, borderColor: border }}
    >
      {label}
    </button>
  )
}
