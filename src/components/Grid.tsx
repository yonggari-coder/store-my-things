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

const cellId = (x: number, y: number) => `${x}:${y}`
const parseCellId = (id: string): Position => {
  const [x, y] = id.split(':').map(Number)
  return { x, y }
}

export default function Grid({
  gridSize,
  nodes,
  containerIds,
  armedPosition,
  onArm,
  onCreate,
  onMenu,
  onDragSwap,
  onResize,
}: {
  gridSize: GridSize
  nodes: MapNode[]
  containerIds: ReadonlySet<string>
  armedPosition: Position | null
  onArm: (pos: Position) => void
  onCreate: (pos: Position) => void
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
    const { active, delta } = event
    if (!active) return
    const sourcePos = parseCellId(active.id as string)
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return
    const cellW = rect.width / gridSize.width
    const cellH = rect.height / gridSize.height
    if (cellW <= 0 || cellH <= 0) return
    const sourceNode = nodes.find(
      (n) => n.position.x === sourcePos.x && n.position.y === sourcePos.y,
    )
    if (!sourceNode) return
    const dx = Math.round(delta.x / cellW)
    const dy = Math.round(delta.y / cellH)
    if (dx === 0 && dy === 0) return
    const maxX = gridSize.width - sourceNode.size.width
    const maxY = gridSize.height - sourceNode.size.height
    const targetX = Math.max(0, Math.min(maxX, sourcePos.x + dx))
    const targetY = Math.max(0, Math.min(maxY, sourcePos.y + dy))
    if (targetX === sourcePos.x && targetY === sourcePos.y) return
    onDragSwap(sourcePos, { x: targetX, y: targetY })
  }

  const cells: ReactNode[] = []

  for (const n of nodes) {
    const id = cellId(n.position.x, n.position.y)
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
        armedPosition={armedPosition}
        onArm={onArm}
        onCreate={onCreate}
        onMenu={onMenu}
        onResize={onResize}
      />,
    )
  }

  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      if (occupied.has(`${x},${y}`)) continue
      const id = cellId(x, y)
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
          armedPosition={armedPosition}
          onArm={onArm}
          onCreate={onCreate}
          onMenu={onMenu}
          onResize={onResize}
        />,
      )
    }
  }

  return (
    <div className="p-3">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
      </DndContext>
    </div>
  )
}
