import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Move,
  Plus,
  Trash2,
} from 'lucide-react'
import { useRef, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { maxSizeFrom } from '../lib/grid'
import type { GridSize, MapNode, Position } from '../types'
import ChildDots from './ChildDots'

export default function EditableGridCell({
  node,
  position,
  isContainer,
  gridSize,
  allNodes,
  gridRef,
  armedPosition,
  parentHref,
  onArm,
  onCreate,
  onDelete,
  onMenu,
  onMove,
  onResize,
}: {
  cellId: string
  node: MapNode | null
  position: Position
  isContainer: boolean
  gridSize: GridSize
  allNodes: MapNode[]
  gridRef: RefObject<HTMLDivElement | null>
  armedPosition: Position | null
  parentHref: string | null
  onArm: (pos: Position) => void
  onCreate: (pos: Position) => void
  onDelete: (nodeId: string) => void
  onMenu: (node: MapNode) => void
  onMove: (nodeId: string, pos: Position) => void
  onResize: (nodeId: string, size: GridSize) => void
}) {
  const [previewSize, setPreviewSize] = useState<GridSize | null>(null)
  const [moveOffset, setMoveOffset] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [overTrash, setOverTrash] = useState(false)
  const resizeStateRef = useRef<{ pointerId: number } | null>(null)
  const trashRef = useRef<HTMLDivElement | null>(null)

  const renderSize: GridSize =
    previewSize ?? node?.size ?? { width: 1, height: 1 }
  const placement: CSSProperties = {
    gridColumn: `${position.x + 1} / span ${renderSize.width}`,
    gridRow: `${position.y + 1} / span ${renderSize.height}`,
  }

  if (node === null) {
    const isArmed =
      !!armedPosition &&
      armedPosition.x === position.x &&
      armedPosition.y === position.y
    if (isArmed) {
      return (
        <button
          type="button"
          onClick={() => onCreate(position)}
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
        onClick={() => onArm(position)}
        aria-label="빈 셀"
        style={placement}
        className="min-h-0 rounded-md border-2 border-dashed border-neutral-200 active:bg-neutral-100"
      />
    )
  }

  const currentNode = node
  const tint = currentNode.color ? `${currentNode.color}1a` : '#ffffff'
  const border = currentNode.color ?? '#e5e5e5'

  const computeSizeFromPointer = (e: {
    clientX: number
    clientY: number
  }): GridSize => {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return currentNode.size
    const xFrac = (e.clientX - rect.left) / rect.width
    const yFrac = (e.clientY - rect.top) / rect.height
    const colTarget = Math.max(
      0,
      Math.min(gridSize.width - 1, Math.floor(xFrac * gridSize.width)),
    )
    const rowTarget = Math.max(
      0,
      Math.min(gridSize.height - 1, Math.floor(yFrac * gridSize.height)),
    )
    const desiredW = Math.max(1, colTarget - position.x + 1)
    const desiredH = Math.max(1, rowTarget - position.y + 1)
    return maxSizeFrom(
      currentNode,
      { width: desiredW, height: desiredH },
      gridSize,
      allNodes,
    )
  }

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const target = e.currentTarget
    if (target.setPointerCapture) {
      try {
        target.setPointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }
    resizeStateRef.current = { pointerId: e.pointerId }
    setPreviewSize(computeSizeFromPointer(e))
  }

  const handleResizePointerMove = (e: React.PointerEvent) => {
    const rs = resizeStateRef.current
    if (!rs || rs.pointerId !== e.pointerId) return
    e.stopPropagation()
    setPreviewSize(computeSizeFromPointer(e))
  }

  const handleResizePointerUp = (e: React.PointerEvent) => {
    const rs = resizeStateRef.current
    if (!rs || rs.pointerId !== e.pointerId) return
    e.stopPropagation()
    const target = e.currentTarget
    if (target.releasePointerCapture) {
      try {
        target.releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }
    const final = computeSizeFromPointer(e)
    resizeStateRef.current = null
    setPreviewSize(null)
    if (
      final.width !== currentNode.size.width ||
      final.height !== currentNode.size.height
    ) {
      onResize(currentNode.id, final)
    }
  }

  const handleMovePointerDown = (
    e: React.PointerEvent<HTMLSpanElement>,
  ) => {
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const pointerId = e.pointerId
    setMoveOffset({ x: 0, y: 0 })

    const isOverTrash = (ev: PointerEvent): boolean => {
      const tr = trashRef.current?.getBoundingClientRect()
      if (!tr) return false
      return (
        ev.clientX >= tr.left &&
        ev.clientX <= tr.right &&
        ev.clientY >= tr.top &&
        ev.clientY <= tr.bottom
      )
    }

    const handleDocMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      setMoveOffset({ x: ev.clientX - startX, y: ev.clientY - startY })
      setOverTrash(isOverTrash(ev))
    }
    const handleDocUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      document.removeEventListener('pointermove', handleDocMove)
      document.removeEventListener('pointerup', handleDocUp)
      document.removeEventListener('pointercancel', handleDocUp)

      if (isOverTrash(ev)) {
        onDelete(currentNode.id)
        setOverTrash(false)
        setMoveOffset(null)
        return
      }

      const rect = gridRef.current?.getBoundingClientRect()
      if (rect) {
        const cellW = rect.width / gridSize.width
        const cellH = rect.height / gridSize.height
        if (cellW > 0 && cellH > 0) {
          const dx = Math.round((ev.clientX - startX) / cellW)
          const dy = Math.round((ev.clientY - startY) / cellH)
          const maxX = gridSize.width - currentNode.size.width
          const maxY = gridSize.height - currentNode.size.height
          const targetX = Math.max(0, Math.min(maxX, position.x + dx))
          const targetY = Math.max(0, Math.min(maxY, position.y + dy))
          if (targetX !== position.x || targetY !== position.y) {
            onMove(currentNode.id, { x: targetX, y: targetY })
          }
        }
      }
      setOverTrash(false)
      setMoveOffset(null)
    }
    document.addEventListener('pointermove', handleDocMove)
    document.addEventListener('pointerup', handleDocUp)
    document.addEventListener('pointercancel', handleDocUp)
  }

  const stopClick = (e: React.MouseEvent) => e.stopPropagation()
  const isMoving = moveOffset !== null

  const cornerBtnBase: CSSProperties = {
    position: 'absolute',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.92)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
    color: '#404040',
  }

  return (
    <div
      style={{
        ...placement,
        transform: moveOffset
          ? `translate(${moveOffset.x}px, ${moveOffset.y}px) scale(1.06)`
          : undefined,
        transition: isMoving ? 'none' : 'transform 120ms ease-out',
        zIndex: isMoving ? 10 : previewSize ? 5 : undefined,
        opacity: isMoving ? 0.92 : 1,
        boxShadow: isMoving
          ? '0 12px 28px rgba(0,0,0,0.22)'
          : previewSize
            ? '0 0 0 2px #3b82f6'
            : undefined,
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      className="relative min-h-0"
    >
      <div
        style={{
          backgroundColor: tint,
          borderColor: border,
        }}
        className="absolute inset-0 flex min-h-0 flex-col items-stretch overflow-hidden rounded-md border p-1.5 pt-7 text-left"
      >
        <span className="pointer-events-none line-clamp-2 text-[11px] leading-tight font-medium text-neutral-800">
          {currentNode.name}
        </span>
        {isContainer && (
          <span className="pointer-events-none">
            <ChildDots />
          </span>
        )}
      </div>

      {parentHref && (
        <Link
          to={parentHref}
          onClick={stopClick}
          style={{
            ...cornerBtnBase,
            left: 4,
            top: 4,
            width: 22,
            height: 22,
            color: '#1d4ed8',
          }}
          aria-label="밖으로 나가기"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMenu(currentNode)
        }}
        style={{
          ...cornerBtnBase,
          right: 30,
          top: 4,
          width: 22,
          height: 22,
        }}
        aria-label="메뉴"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      <Link
        to={`/app/s/${currentNode.spaceId}/n/${currentNode.id}`}
        onClick={stopClick}
        style={{
          ...cornerBtnBase,
          right: 4,
          top: 4,
          width: 22,
          height: 22,
          color: '#1d4ed8',
        }}
        aria-label="안으로 들어가기"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>

      <span
        role="button"
        aria-label="옮기기"
        onPointerDown={handleMovePointerDown}
        onClick={stopClick}
        style={{
          ...cornerBtnBase,
          left: 4,
          bottom: 4,
          width: 32,
          height: 32,
          touchAction: 'none',
          cursor: isMoving ? 'grabbing' : 'grab',
          background: 'rgba(59,130,246,0.32)',
          color: '#1d4ed8',
        }}
      >
        <Move className="h-4 w-4" />
      </span>

      <span
        role="button"
        aria-label="크기 조절"
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        onClick={stopClick}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 32,
          height: 32,
          zIndex: 3,
          touchAction: 'none',
          cursor: 'nwse-resize',
          background:
            'linear-gradient(135deg, transparent 50%, rgba(59,130,246,0.32) 50%)',
          borderBottomRightRadius: 6,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-1 bottom-1"
          aria-hidden
        >
          <path
            d="M3 14 L14 3 M7 14 L14 7 M11 14 L14 11"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {isMoving &&
        createPortal(
          <div
            ref={trashRef}
            aria-hidden
            style={{
              position: 'fixed',
              right: 20,
              bottom: `calc(20px + env(safe-area-inset-bottom, 0px))`,
              width: 64,
              height: 64,
              borderRadius: 32,
              background: overTrash ? '#ef4444' : 'rgba(239,68,68,0.85)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              boxShadow: overTrash
                ? '0 8px 32px rgba(239,68,68,0.5)'
                : '0 4px 16px rgba(0,0,0,0.3)',
              transition: 'transform 120ms, background 120ms, box-shadow 120ms',
              transform: overTrash ? 'scale(1.18)' : 'scale(1)',
              pointerEvents: 'none',
            }}
          >
            <Trash2 className="h-7 w-7" />
          </div>,
          document.body,
        )}
    </div>
  )
}
