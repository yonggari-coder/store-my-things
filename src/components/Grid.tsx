import type { ReactNode } from 'react'
import type { GridSize, MapNode, Position } from '../types'
import GridCell from './GridCell'

export default function Grid({
  spaceId,
  gridSize,
  nodes,
  containerIds,
  armedPosition,
  onArm,
  onCreate,
  onEdit,
}: {
  spaceId: string
  gridSize: GridSize
  nodes: MapNode[]
  containerIds: ReadonlySet<string>
  armedPosition: Position | null
  onArm: (pos: Position) => void
  onCreate: (pos: Position) => void
  onEdit: (node: MapNode) => void
}) {
  const byPos = new Map<string, MapNode>()
  for (const n of nodes) {
    byPos.set(`${n.position.x},${n.position.y}`, n)
  }

  const cells: ReactNode[] = []
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const node = byPos.get(`${x},${y}`) ?? null
      const isArmed =
        node === null &&
        armedPosition !== null &&
        armedPosition.x === x &&
        armedPosition.y === y
      cells.push(
        <GridCell
          key={`${x},${y}`}
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
