import { useMemo, useRef, useState, type RefObject } from 'react'
import { buildOccupancy } from '../lib/grid'
import type { GridSize, MapNode, Position } from '../types'

type Rect = { x: number; y: number; width: number; height: number }

export default function DrawingOverlay({
  gridSize,
  nodes,
  gridRef,
  onDraw,
}: {
  gridSize: GridSize
  nodes: MapNode[]
  gridRef: RefObject<HTMLDivElement | null>
  onDraw: (pos: Position, size: GridSize) => void
}) {
  const [start, setStart] = useState<Position | null>(null)
  const [end, setEnd] = useState<Position | null>(null)
  const pointerIdRef = useRef<number | null>(null)

  const occupancy = useMemo(() => buildOccupancy(nodes), [nodes])

  const cellFromPointer = (
    clientX: number,
    clientY: number,
  ): Position | null => {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    const xFrac = (clientX - rect.left) / rect.width
    const yFrac = (clientY - rect.top) / rect.height
    const x = Math.max(
      0,
      Math.min(gridSize.width - 1, Math.floor(xFrac * gridSize.width)),
    )
    const y = Math.max(
      0,
      Math.min(gridSize.height - 1, Math.floor(yFrac * gridSize.height)),
    )
    return { x, y }
  }

  const rectFrom = (s: Position, e: Position): Rect => ({
    x: Math.min(s.x, e.x),
    y: Math.min(s.y, e.y),
    width: Math.abs(e.x - s.x) + 1,
    height: Math.abs(e.y - s.y) + 1,
  })

  const wouldOverlap = (r: Rect): boolean => {
    for (let dy = 0; dy < r.height; dy++) {
      for (let dx = 0; dx < r.width; dx++) {
        if (occupancy.has(`${r.x + dx},${r.y + dy}`)) return true
      }
    }
    return false
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = cellFromPointer(e.clientX, e.clientY)
    if (!p) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pointerIdRef.current = e.pointerId
    setStart(p)
    setEnd(p)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return
    const p = cellFromPointer(e.clientX, e.clientY)
    if (p) setEnd(p)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    pointerIdRef.current = null
    if (start && end) {
      const r = rectFrom(start, end)
      if (!wouldOverlap(r)) {
        onDraw(
          { x: r.x, y: r.y },
          { width: r.width, height: r.height },
        )
      }
    }
    setStart(null)
    setEnd(null)
  }

  const preview = start && end ? rectFrom(start, end) : null
  const overlap = preview ? wouldOverlap(preview) : false

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridSize.height}, minmax(0, 1fr))`,
        gap: '0.375rem',
        padding: 0,
        touchAction: 'none',
        cursor: 'crosshair',
      }}
      aria-label="그리기 영역"
    >
      {preview && (
        <div
          style={{
            gridColumn: `${preview.x + 1} / span ${preview.width}`,
            gridRow: `${preview.y + 1} / span ${preview.height}`,
            background: overlap
              ? 'rgba(239,68,68,0.22)'
              : 'rgba(59,130,246,0.22)',
            border: overlap
              ? '2px dashed #ef4444'
              : '2px dashed #3b82f6',
            borderRadius: 6,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
