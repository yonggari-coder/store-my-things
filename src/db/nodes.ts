import type { GridSize, MapNode, Position } from '../types'
import { generateId } from '../lib/id'
import { LOCAL_OWNER } from '../lib/owner'
import { db } from './index'

export const DEFAULT_GRID: GridSize = { width: 4, height: 4 }
export const DEFAULT_NODE_SIZE: GridSize = { width: 1, height: 1 }

export async function createNode(input: {
  spaceId: string
  parentId: string | null
  name: string
  position: Position
  size?: GridSize
  color?: string | null
  category?: string | null
  memo?: string | null
  childGridSize?: GridSize
}): Promise<MapNode> {
  const now = Date.now()
  const node: MapNode = {
    id: generateId(),
    spaceId: input.spaceId,
    parentId: input.parentId,
    ownerId: LOCAL_OWNER,
    name: input.name,
    color: input.color ?? null,
    category: input.category ?? null,
    memo: input.memo ?? null,
    position: input.position,
    size: input.size ?? DEFAULT_NODE_SIZE,
    childGridSize: input.childGridSize ?? DEFAULT_GRID,
    createdAt: now,
    updatedAt: now,
  }
  await db.nodes.add(node)
  return node
}

export async function getNode(id: string): Promise<MapNode | undefined> {
  return db.nodes.get(id)
}

export async function listChildren(
  spaceId: string,
  parentId: string | null,
): Promise<MapNode[]> {
  // IndexedDB does not index null keys, so [spaceId+parentId] can't be used
  // when parentId is null. Falling back to spaceId + in-memory filter is fine
  // because the per-level child count is small.
  return db.nodes
    .where('spaceId')
    .equals(spaceId)
    .filter((n) => n.parentId === parentId)
    .toArray()
}

export async function updateNode(
  id: string,
  patch: Partial<Omit<MapNode, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.nodes.update(id, { ...patch, updatedAt: Date.now() })
}

export async function deleteNode(id: string): Promise<void> {
  await db.transaction('rw', db.nodes, async () => {
    const toDelete: string[] = []
    const queue: string[] = [id]
    while (queue.length > 0) {
      const current = queue.shift()!
      toDelete.push(current)
      const children = await db.nodes
        .where('parentId')
        .equals(current)
        .toArray()
      queue.push(...children.map((c) => c.id))
    }
    await db.nodes.bulkDelete(toDelete)
  })
}
