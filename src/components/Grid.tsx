import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useRef, type ReactNode } from 'react'
import { buildOccupancy } from '../lib/grid'
import type { GridSize, MapNode, Position } from '../types'
import EditableGridCell from './EditableGridCell'
import GridCell from './GridCell'

const cellId = (x: number, y: number) => `${x}:${y}`
const parseCellId = (id: string): Position => {
  const [x, y] = id.split(':').map(Number)
  return { x, y }
}

export default function Grid({
  spaceId,
  gridSize,
  nodes,
  containerIds,
  editing,
  armedPosition,
  highlightId,
  onArm,
  onCreate,
  onEdit,
  onMenu,
  onDragSwap,
  onResize,
}: {
  spaceId: string
  gridSize: GridSize
  nodes: MapNode[]
  containerIds: ReadonlySet<string>
  editing: boolean
  armedPosition: Position | null
  highlightId: string | null
  onArm: (pos: Position) => void
  onCreate: (pos: Position) => void
  onEdit: (node: MapNode) => void
  onMenu: (node: MapNode) => void
  onDragSwap: (sourcePos: Position, targetPos: Position) => void
  onResize: (nodeId: string, size: GridSize) => void
}) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const occupied = buildOccupancy(nodes)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
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

  for (const n of nodes) {
    const id = cellId(n.position.x, n.position.y)
    if (editing) {
      cells.push(
        <EditableGridCell
          key={`n-${n.id}`}
          cellId={id}
          node={n}
          position={n.position}
          isContainer={containerIds.has(n.id)}
          gridSize={gridSize}
          allNodes={nodes}
          gridRef={gridRef}
          onMenu={onMenu}
          onResize={onResize}
        />,
      )
    } else {
      cells.push(
        <GridCell
          key={`n-${n.id}`}
          spaceId={spaceId}
          node={n}
          position={n.position}
          isContainer={containerIds.has(n.id)}
          isArmed={false}
          highlighted={n.id === highlightId}
          onArm={() => undefined}
          onCreate={() => undefined}
          onEdit={() => onEdit(n)}
        />,
      )
    }
  }

  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      if (occupied.has(`${x},${y}`)) continue
      const id = cellId(x, y)
      if (editing) {
        cells.push(
          <EditableGridCell
            key={`e-${id}`}
            cellId={id}
            node={null}
            position={{ x, y }}
            isContainer={false}
            gridSize={gridSize}
            allNodes={nodes}
            gridRef={gridRef}
            onMenu={onMenu}
            onResize={onResize}
          />,
        )
      } else {
        const isArmed =
          armedPosition !== null &&
          armedPosition.x === x &&
          armedPosition.y === y
        cells.push(
          <GridCell
            key={`e-${id}`}
            spaceId={spaceId}
            node={null}
            position={{ x, y }}
            isContainer={false}
            isArmed={isArmed}
            highlighted={false}
            onArm={() => onArm({ x, y })}
            onCreate={() => onCreate({ x, y })}
            onEdit={() => undefined}
          />,
        )
      }
    }
  }

  const grid = (
    <div
      ref={gridRef}
      className="grid gap-1.5"
      style={{
        gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridSize.height}, minmax(0, 1fr))`,
        aspectRatio: `${gridSize.width} / ${gridSize.height}`,
      }}
    >
      {cells}
    </div>
  )

  if (editing) {
    return (
      <div className="p-3">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {grid}
        </DndContext>
      </div>
    )
  }
  return <div className="p-3">{grid}</div>
}
