import type { GridSize, Space } from '../types'
import { generateId } from '../lib/id'
import { LOCAL_OWNER } from '../lib/owner'
import { db } from './index'

export const DEFAULT_ROOT_GRID: GridSize = { width: 10, height: 10 }

export async function createSpace(input: { name: string }): Promise<Space> {
  const now = Date.now()
  const space: Space = {
    id: generateId(),
    name: input.name,
    ownerId: LOCAL_OWNER,
    rootGridSize: DEFAULT_ROOT_GRID,
    createdAt: now,
    updatedAt: now,
  }
  await db.spaces.add(space)
  return space
}

export async function updateRootGridSize(
  id: string,
  rootGridSize: GridSize,
): Promise<void> {
  await db.spaces.update(id, { rootGridSize, updatedAt: Date.now() })
}

export async function listSpaces(): Promise<Space[]> {
  return db.spaces.orderBy('createdAt').toArray()
}

export async function getSpace(id: string): Promise<Space | undefined> {
  return db.spaces.get(id)
}

export async function updateSpace(
  id: string,
  patch: Partial<Pick<Space, 'name'>>,
): Promise<void> {
  await db.spaces.update(id, { ...patch, updatedAt: Date.now() })
}

export async function deleteSpace(id: string): Promise<void> {
  await db.transaction('rw', db.spaces, db.nodes, async () => {
    await db.nodes.where('spaceId').equals(id).delete()
    await db.spaces.delete(id)
  })
}
