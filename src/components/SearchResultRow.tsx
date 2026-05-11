import { Link } from 'react-router-dom'
import type { MapNode } from '../types'

export default function SearchResultRow({
  node,
  pathParts,
}: {
  node: MapNode
  pathParts: string[]
}) {
  const target =
    node.parentId === null
      ? `/app/s/${node.spaceId}?highlight=${node.id}`
      : `/app/s/${node.spaceId}/n/${node.parentId}?highlight=${node.id}`

  const dot = node.color ?? '#a3a3a3'

  return (
    <li>
      <Link
        to={target}
        className="flex items-start gap-3 border-b border-neutral-100 px-4 py-3 active:bg-neutral-100"
      >
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="text-base font-medium text-neutral-900">
            {node.name}
          </div>
          <div className="truncate text-xs text-neutral-500">
            {pathParts.join(' › ')}
          </div>
        </div>
      </Link>
    </li>
  )
}
