import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { ReactNode, RefObject } from 'react'
import type { GridSize, MapNode, Position } from '../types'
import EditableGridCell from './EditableGridCell'
import GridCell from './GridCell'
import ResizeHandle from './ResizeHandle'

const cellId = (x: number, y: number) => `${x}:${y}`
const parseCellId = (id: string): Position => {
  const [x, y] = id.split(':').map(Number)
  return { x, y }
}

export default function Grid({
  gridRef,
  spaceId,
  gridSize,
  nodes,
  containerIds,
  editing,
  armedPosition,
  onArm,
  onCreate,
  onEdit,
  onMenu,
  onDragSwap,
  onResizePreview,
  onResizeCommit,
  minSize,
  maxSize,
}: {
  gridRef: RefObject<HTMLDivElement | null>
  spaceId: string
  gridSize: GridSize
  nodes: MapNode[]
  containerIds: ReadonlySet<string>
  editing: boolean
  armedPosition: Position | null
  onArm: (pos: Position) => void
  onCreate: (pos: Position) => void
  onEdit: (node: MapNode) => void
  onMenu: (node: MapNode) => void
  onDragSwap: (sourcePos: Position, targetPos: Position) => void
  onResizePreview: (next: GridSize) => void
  onResizeCommit: (next: GridSize) => void
  minSize: GridSize
  maxSize: GridSize
}) {
  const byPos = new Map<string, MapNode>()
  for (const n of nodes) {
    byPos.set(`${n.position.x},${n.position.y}`, n)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const sourcePos = parseCellId(active.id as string)
    const targetPos = parseCellId(over.id as string)
    onDragSwap(sourcePos, targetPos)
  }

  const cells: ReactNode[] = []
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const node = byPos.get(`${x},${y}`) ?? null
      const id = cellId(x, y)
      if (editing) {
        cells.push(
          <EditableGridCell
            key={id}
            cellId={id}
            node={node}
            isContainer={node ? containerIds.has(node.id) : false}
            onMenu={onMenu}
          />,
        )
      } else {
        const isArmed =
          node === null &&
          armedPosition !== null &&
          armedPosition.x === x &&
          armedPosition.y === y
        cells.push(
          <GridCell
            key={id}
            spaceId={spaceId}
            node={node}
            isContainer={node ? containerIds.has(node.id) : false}
            isArmed={isArmed}
            onArm={() => onArm({ x, y })}
            onCreate={() => onCreate({ x, y })}
            onEdit={() => {
              if (node) onEdit(node)
            }}
          />,
        )
      }
    }
  }

  const inner = (
    <div className="relative">
      <div
        ref={gridRef}
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>
      {editing && (
        <ResizeHandle
          gridRef={gridRef}
          baseSize={gridSize}
          minSize={minSize}
          maxSize={maxSize}
          onPreview={onResizePreview}
          onCommit={onResizeCommit}
        />
      )}
    </div>
  )

  if (editing) {
    return (
      <div className="p-3">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {inner}
        </DndContext>
      </div>
    )
  }

  return <div className="p-3">{inner}</div>
}
