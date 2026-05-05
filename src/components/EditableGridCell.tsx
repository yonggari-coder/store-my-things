import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useRef, useState, type CSSProperties, type RefObject } from 'react'
import { maxSizeFrom } from '../lib/grid'
import type { GridSize, MapNode, Position } from '../types'
import ChildDots from './ChildDots'

type ResizeAxis = 'w' | 'h' | 'wh'

export default function EditableGridCell({
  cellId,
  node,
  position,
  isContainer,
  gridSize,
  allNodes,
  gridRef,
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
  const dragStateRef = useRef<{ axis: ResizeAxis; pointerId: number } | null>(
    null,
  )
  const justResizedRef = useRef(false)

  const renderSize: GridSize =
    previewSize ?? node?.size ?? { width: 1, height: 1 }
  const placement: CSSProperties = {
    gridColumn: `${position.x + 1} / span ${renderSize.width}`,
    gridRow: `${position.y + 1} / span ${renderSize.height}`,
  }

  if (node === null) {
    return (
      <div
        ref={setDropRef}
        aria-label="빈 셀"
        style={placement}
        className={
          isOver
            ? 'min-h-0 rounded-md border-2 border-blue-500 bg-blue-50'
            : 'min-h-0 rounded-md border-2 border-dashed border-neutral-200'
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

  const computeSizeFromPointer = (
    e: { clientX: number; clientY: number },
    axis: ResizeAxis,
  ): GridSize => {
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
    const desiredW =
      axis === 'h'
        ? currentNode.size.width
        : Math.max(1, colTarget - position.x + 1)
    const desiredH =
      axis === 'w'
        ? currentNode.size.height
        : Math.max(1, rowTarget - position.y + 1)
    return maxSizeFrom(
      currentNode,
      { width: desiredW, height: desiredH },
      gridSize,
      allNodes,
    )
  }

  const handlePointerDown = (e: React.PointerEvent, axis: ResizeAxis) => {
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
    dragStateRef.current = { axis, pointerId: e.pointerId }
    justResizedRef.current = true
    setPreviewSize(computeSizeFromPointer(e, axis))
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const ds = dragStateRef.current
    if (!ds || ds.pointerId !== e.pointerId) return
    e.stopPropagation()
    setPreviewSize(computeSizeFromPointer(e, ds.axis))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
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
    const final = computeSizeFromPointer(e, ds.axis)
    dragStateRef.current = null
    setPreviewSize(null)
    if (
      final.width !== currentNode.size.width ||
      final.height !== currentNode.size.height
    ) {
      onResize(currentNode.id, final)
    }
  }

  const handleClick = () => {
    if (justResizedRef.current) {
      justResizedRef.current = false
      return
    }
    onMenu(currentNode)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const stopClick = (e: React.MouseEvent) => e.stopPropagation()

  const handleBaseStyle: CSSProperties = {
    touchAction: 'none',
    position: 'absolute',
    zIndex: 2,
  }

  return (
    <div
      ref={setRefs}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        ...placement,
        backgroundColor: tint,
        borderColor: isOver ? '#3b82f6' : border,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging ? 10 : previewSize ? 5 : undefined,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isOver
          ? '0 0 0 2px #3b82f6'
          : previewSize
            ? '0 0 0 2px #3b82f6'
            : undefined,
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      className="relative flex min-h-0 cursor-pointer flex-col items-stretch overflow-hidden rounded-md border p-1.5 text-left"
    >
      <span className="pointer-events-none line-clamp-2 text-[11px] leading-tight font-medium text-neutral-800">
        {currentNode.name}
      </span>
      {isContainer && (
        <span className="pointer-events-none">
          <ChildDots />
        </span>
      )}

      <span
        role="presentation"
        onPointerDown={(e) => handlePointerDown(e, 'w')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={stopClick}
        style={{
          ...handleBaseStyle,
          top: 0,
          right: 0,
          bottom: 18,
          width: 20,
          cursor: 'ew-resize',
          background:
            'linear-gradient(to left, rgba(59,130,246,0.18), transparent)',
        }}
        aria-label="너비 조절"
      >
        <span className="pointer-events-none absolute top-1/2 right-1 h-8 w-1.5 -translate-y-1/2 rounded-full bg-blue-500" />
      </span>

      <span
        role="presentation"
        onPointerDown={(e) => handlePointerDown(e, 'h')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={stopClick}
        style={{
          ...handleBaseStyle,
          left: 0,
          right: 18,
          bottom: 0,
          height: 20,
          cursor: 'ns-resize',
          background:
            'linear-gradient(to top, rgba(59,130,246,0.18), transparent)',
        }}
        aria-label="높이 조절"
      >
        <span className="pointer-events-none absolute bottom-1 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-blue-500" />
      </span>

      <span
        role="presentation"
        onPointerDown={(e) => handlePointerDown(e, 'wh')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={stopClick}
        style={{
          ...handleBaseStyle,
          right: 0,
          bottom: 0,
          width: 24,
          height: 24,
          zIndex: 3,
          cursor: 'nwse-resize',
          background: 'rgba(59,130,246,0.18)',
        }}
        aria-label="크기 조절"
      >
        <span className="pointer-events-none absolute right-1 bottom-1 h-3 w-3 rounded-sm bg-blue-600" />
      </span>
    </div>
  )
}
