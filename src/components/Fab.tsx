import type { ReactNode } from 'react'

export default function Fab({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-4 bottom-4 flex h-12 items-center gap-2 rounded-full bg-blue-600 pr-5 pl-4 text-white shadow-lg transition active:scale-95 active:bg-blue-700"
    >
      {children}
    </button>
  )
}
