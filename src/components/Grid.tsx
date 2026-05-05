import type { ReactNode } from 'react'
import type { GridSize, MapNode } from '../types'
import GridCell from './GridCell'

export default function Grid({
  gridSize,
  nodes,
  containerIds,
}: {
  gridSize: GridSize
  nodes: MapNode[]
  containerIds: ReadonlySet<string>
}) {
  const byPos = new Map<string, MapNode>()
  for (const n of nodes) {
    byPos.set(`${n.position.x},${n.position.y}`, n)
  }

  const cells: ReactNode[] = []
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const node = byPos.get(`${x},${y}`) ?? null
      cells.push(
        <GridCell
          key={`${x},${y}`}
          node={node}
          isContainer={node ? containerIds.has(node.id) : false}
        />,
      )
    }
  }

  return (
    <div
      className="grid gap-1.5 p-3"
      style={{
        gridTemplateColumns: `repeat(${gridSize.width}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  )
}
