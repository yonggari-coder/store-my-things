import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { MapNode } from '../types'
import ChildDots from './ChildDots'

export default function EditableGridCell({
  cellId,
  node,
  isContainer,
  onMenu,
}: {
  cellId: string
  node: MapNode | null
  isContainer: boolean
  onMenu: (node: MapNode) => void
}) {
  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
    transform,
    isDragging,
  } = useDraggable({ id: cellId, disabled: !node })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: cellId })

  if (node === null) {
    return (
      <div
        ref={setDropRef}
        aria-label="빈 셀"
        className={
          isOver
            ? 'aspect-square rounded-md border-2 border-blue-500 bg-blue-50'
            : 'aspect-square rounded-md border-2 border-dashed border-neutral-200'
        }
      />
    )
  }

  const tint = node.color ? `${node.color}1a` : '#ffffff'
  const border = node.color ?? '#e5e5e5'

  const setRefs = (el: HTMLButtonElement | null) => {
    setDragRef(el)
    setDropRef(el)
  }

  return (
    <button
      type="button"
      ref={setRefs}
      onClick={() => onMenu(node)}
      style={{
        backgroundColor: tint,
        borderColor: isOver ? '#3b82f6' : border,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isOver ? '0 0 0 2px #3b82f6' : undefined,
      }}
      {...attributes}
      {...listeners}
      className="relative flex aspect-square flex-col items-stretch overflow-hidden rounded-md border p-1.5 text-left"
    >
      <span className="line-clamp-2 text-[11px] leading-tight font-medium text-neutral-800">
        {node.name}
      </span>
      {isContainer && <ChildDots />}
    </button>
  )
}
