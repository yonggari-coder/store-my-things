import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { useRef } from 'react'
import type { GridSize } from '../types'

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

export default function ResizeHandle({
  gridRef,
  baseSize,
  minSize,
  maxSize,
  onPreview,
  onCommit,
}: {
  gridRef: RefObject<HTMLDivElement | null>
  baseSize: GridSize
  minSize: GridSize
  maxSize: GridSize
  onPreview: (next: GridSize) => void
  onCommit: (next: GridSize) => void
}) {
  const startRef = useRef<{
    pointerX: number
    pointerY: number
    cellW: number
    cellH: number
    base: GridSize
    lastSize: GridSize
  } | null>(null)

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (!gridRef.current) return
    e.preventDefault()
    const rect = gridRef.current.getBoundingClientRect()
    startRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      cellW: rect.width / baseSize.width,
      cellH: rect.height / baseSize.height,
      base: baseSize,
      lastSize: baseSize,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent) => {
    const start = startRef.current
    if (!start) return
    const dx = e.clientX - start.pointerX
    const dy = e.clientY - start.pointerY
    const dCols = Math.round(dx / start.cellW)
    const dRows = Math.round(dy / start.cellH)
    const next: GridSize = {
      width: clamp(start.base.width + dCols, minSize.width, maxSize.width),
      height: clamp(start.base.height + dRows, minSize.height, maxSize.height),
    }
    if (
      next.width !== start.lastSize.width ||
      next.height !== start.lastSize.height
    ) {
      start.lastSize = next
      onPreview(next)
    }
  }

  const handlePointerUp = () => {
    const start = startRef.current
    if (!start) return
    onCommit(start.lastSize)
    startRef.current = null
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="slider"
      aria-label="격자 크기 조절"
      aria-valuetext={`${baseSize.width} × ${baseSize.height}`}
      className="absolute right-0 bottom-0 flex h-7 w-7 cursor-se-resize touch-none items-end justify-end p-1"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-full w-full text-blue-500"
        aria-hidden
      >
        <path
          d="M14 6 L14 14 L6 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="14" cy="14" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}
