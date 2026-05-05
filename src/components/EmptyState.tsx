import type { ReactNode } from 'react'

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <h2 className="text-base font-medium text-neutral-700">{title}</h2>
      {description && (
        <p className="max-w-xs text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
