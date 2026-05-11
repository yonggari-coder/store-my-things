import { useRef, type ReactNode } from 'react'
import { buildOccupancy } from '../lib/grid'
import type { GridSize, MapNode, Position } from '../types'
import EditableGridCell from './EditableGridCell'

const cellId = (x: number, y: number) => `${x}:${y}`

export default function Grid({
  gridSize,
  nodes,
  containerIds,
  armedPosition,
  parentHref,
  onArm,
  onCreate,
  onMenu,
  onMove,
  onResize,
}: {
  gridSize: GridSize
  nodes: MapNode[]
  containerIds: ReadonlySet<string>
  armedPosition: Position | null
  parentHref: string | null
  onArm: (pos: Position) => void
  onCreate: (pos: Position) => void
  onMenu: (node: MapNode) => void
  onMove: (nodeId: string, pos: Position) => void
  onResize: (nodeId: string, size: GridSize) => void
}) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const occupied = buildOccupancy(nodes)

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
        parentHref={parentHref}
        onArm={onArm}
        onCreate={onCreate}
        onMenu={onMenu}
        onMove={onMove}
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
          parentHref={parentHref}
          onArm={onArm}
          onCreate={onCreate}
          onMenu={onMenu}
          onMove={onMove}
          onResize={onResize}
        />,
      )
    }
  }

  return (
    <div className="p-3">
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
    </div>
  )
}
