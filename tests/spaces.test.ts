import { describe, expect, it } from 'vitest'
import { db } from '../src/db'
import { createNode } from '../src/db/nodes'
import { createSpace, deleteSpace, listSpaces } from '../src/db/spaces'

describe('spaces', () => {
  it('creates and lists spaces in createdAt order', async () => {
    const a = await createSpace({ name: '내 집' })
    await new Promise((r) => setTimeout(r, 2))
    const b = await createSpace({ name: '사무실' })
    const all = await listSpaces()
    expect(all.map((s) => s.id)).toEqual([a.id, b.id])
  })

  it('cascade-deletes nodes when space is deleted', async () => {
    const space = await createSpace({ name: '내 집' })
    await createNode({
      spaceId: space.id,
      parentId: null,
      name: '안방',
      position: { x: 0, y: 0 },
    })
    await deleteSpace(space.id)
    expect(await db.nodes.count()).toBe(0)
    expect(await db.spaces.count()).toBe(0)
  })
})
