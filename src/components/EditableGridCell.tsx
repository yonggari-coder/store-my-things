import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, MoreHorizontal, Move, Plus } from 'lucide-react'
import { useRef, useState, type CSSProperties, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { maxSizeFrom } from '../lib/grid'
import type { GridSize, MapNode, Position } from '../types'
import ChildDots from './ChildDots'

export default function EditableGridCell({
  cellId,
  node,
  position,
  isContainer,
  gridSize,
  allNodes,
  gridRef,
  armedPosition,
  onArm,
  onCreate,
  onMenu,
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
  onArm: (pos: Position) => void
  onCreate: (pos: Position) => void
  onMenu: (node: MapNode) => void
  onResize: (nodeId: string, size: GridSize) => void
}) {
  const dragDisabled = node === null

  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
    transform,
    isDragging,
  } = useDraggable({ id: cellId, disabled: dragDisabled })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: cellId })

  const [previewSize, setPreviewSize] = useState<GridSize | null>(null)
  const dragStateRef = useRef<{ pointerId: number } | null>(null)

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
          ref={setDropRef}
          onClick={() => onCreate(position)}
          aria-label="새 항목 추가"
          style={placement}
          className={
            isOver
              ? 'flex min-h-0 items-center justify-center rounded-md border-2 border-blue-500 bg-blue-100 text-blue-600'
              : 'flex min-h-0 items-center justify-center rounded-md border-2 border-blue-500 bg-blue-50 text-blue-600 active:bg-blue-100'
          }
        >
          <Plus className="h-5 w-5" />
        </button>
      )
    }
    return (
      <button
        type="button"
        ref={setDropRef}
        onClick={() => onArm(position)}
        aria-label="빈 셀"
        style={placement}
        className={
          isOver
            ? 'min-h-0 rounded-md border-2 border-blue-500 bg-blue-50'
            : 'min-h-0 rounded-md border-2 border-dashed border-neutral-200 active:bg-neutral-100'
        }
      />
    )
  }

  const currentNode = node
  const tint = currentNode.color ? `${currentNode.color}1a` : '#ffffff'
  const border = currentNode.color ?? '#e5e5e5'

  const setRefs = (el: HTMLDivElement | null) => {
    setDragRef(el)
    setDropRef(el)
  }

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
    dragStateRef.current = { pointerId: e.pointerId }
    setPreviewSize(computeSizeFromPointer(e))
  }

  const handleResizePointerMove = (e: React.PointerEvent) => {
    const ds = dragStateRef.current
    if (!ds || ds.pointerId !== e.pointerId) return
    e.stopPropagation()
    setPreviewSize(computeSizeFromPointer(e))
  }

  const handleResizePointerUp = (e: React.PointerEvent) => {
    const ds = dragStateRef.current
    if (!ds || ds.pointerId !== e.pointerId) return
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
    dragStateRef.current = null
    setPreviewSize(null)
    if (
      final.width !== currentNode.size.width ||
      final.height !== currentNode.size.height
    ) {
      onResize(currentNode.id, final)
    }
  }

  const stopClick = (e: React.MouseEvent) => e.stopPropagation()

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
      ref={setRefs}
      style={{
        ...placement,
        transform: transform
          ? `${CSS.Translate.toString(transform)} scale(1.06)`
          : undefined,
        transition: isDragging ? 'none' : 'transform 120ms ease-out',
        zIndex: isDragging ? 10 : previewSize ? 5 : undefined,
        opacity: isDragging ? 0.92 : 1,
        boxShadow: isDragging
          ? '0 12px 28px rgba(0,0,0,0.22)'
          : isOver
            ? '0 0 0 2px #3b82f6'
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
          borderColor: isOver ? '#3b82f6' : border,
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

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMenu(currentNode)
        }}
        style={{
          ...cornerBtnBase,
          left: 4,
          top: 4,
          width: 22,
          height: 22,
        }}
        aria-label="메뉴"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      <Link
        to={`/s/${currentNode.spaceId}/n/${currentNode.id}`}
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
        {...attributes}
        {...listeners}
        onClick={stopClick}
        style={{
          ...cornerBtnBase,
          left: 4,
          bottom: 4,
          width: 26,
          height: 26,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'rgba(59,130,246,0.18)',
          color: '#1d4ed8',
        }}
        aria-label="옮기기"
      >
        <Move className="h-4 w-4" />
      </span>

      <span
        role="presentation"
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
        aria-label="크기 조절"
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
    </div>
  )
}
