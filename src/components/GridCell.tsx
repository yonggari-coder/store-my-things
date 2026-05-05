import type { MapNode } from '../types'
import ChildDots from './ChildDots'

export default function GridCell({
  node,
  isContainer,
}: {
  node: MapNode | null
  isContainer: boolean
}) {
  if (node === null) {
    return (
      <div className="aspect-square rounded-md border-2 border-dashed border-neutral-200" />
    )
  }

  const tint = node.color ? `${node.color}1a` : '#ffffff'
  const border = node.color ?? '#e5e5e5'

  return (
    <div
      className="relative flex aspect-square flex-col items-stretch justify-start overflow-hidden rounded-md border p-1.5"
      style={{ backgroundColor: tint, borderColor: border }}
    >
      <div className="line-clamp-2 text-[11px] leading-tight font-medium text-neutral-800">
        {node.name}
      </div>
      {isContainer && <ChildDots />}
    </div>
  )
}
