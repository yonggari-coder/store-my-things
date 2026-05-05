import { db } from '../db'
import type { MapNode, Space } from '../types'

export type PathSegment =
  | { kind: 'space'; space: Space }
  | { kind: 'node'; node: MapNode }

export async function getPath(
  spaceId: string,
  nodeId: string | null,
): Promise<PathSegment[]> {
  const space = await db.spaces.get(spaceId)
  if (!space) return []

  const segments: PathSegment[] = [{ kind: 'space', space }]
  if (nodeId === null) return segments

  const chain: MapNode[] = []
  let cursor: string | null = nodeId
  while (cursor !== null) {
    const node: MapNode | undefined = await db.nodes.get(cursor)
    if (!node) break
    chain.push(node)
    cursor = node.parentId
  }
  chain.reverse()
  for (const node of chain) {
    segments.push({ kind: 'node', node })
  }
  return segments
}
