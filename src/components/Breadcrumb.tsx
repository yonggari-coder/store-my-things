import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { PathSegment } from '../lib/path'

export default function Breadcrumb({
  path,
  spaceId,
}: {
  path: PathSegment[]
  spaceId: string
}) {
  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-white px-4 py-2 text-sm">
      {path.map((seg, i) => {
        const isLast = i === path.length - 1
        const text =
          seg.kind === 'space' ? seg.space.name : seg.node.name
        const to =
          seg.kind === 'space'
            ? `/app/s/${seg.space.id}`
            : `/app/s/${spaceId}/n/${seg.node.id}`
        const key = seg.kind === 'space' ? `s:${seg.space.id}` : `n:${seg.node.id}`
        return (
          <Fragment key={key}>
            {i > 0 && (
              <span className="text-neutral-300" aria-hidden>
                ›
              </span>
            )}
            {isLast ? (
              <span className="font-medium text-neutral-900">{text}</span>
            ) : (
              <Link
                to={to}
                className="text-neutral-500 hover:text-neutral-900"
              >
                {text}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
