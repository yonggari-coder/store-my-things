import { describe, expect, it } from 'vitest'
import { db } from '../src/db'
import {
  createNode,
  deleteNode,
  listChildren,
  updateNode,
} from '../src/db/nodes'
import { createSpace } from '../src/db/spaces'

async function setupTree() {
  const space = await createSpace({ name: '내 집' })
  const room = await createNode({
    spaceId: space.id,
    parentId: null,
    name: '안방',
    position: { x: 0, y: 0 },
  })
  const closet = await createNode({
    spaceId: space.id,
    parentId: room.id,
    name: '옷장',
    position: { x: 0, y: 0 },
  })
  const drawer = await createNode({
    spaceId: space.id,
    parentId: closet.id,
    name: '위 서랍',
    position: { x: 0, y: 0 },
  })
  const wallet = await createNode({
    spaceId: space.id,
    parentId: drawer.id,
    name: '지갑',
    position: { x: 0, y: 0 },
  })
  return { space, room, closet, drawer, wallet }
}

describe('nodes', () => {
  it('lists root nodes when parentId is null', async () => {
    const { space, room } = await setupTree()
    const roots = await listChildren(space.id, null)
    expect(roots).toHaveLength(1)
    expect(roots[0].id).toBe(room.id)
  })

  it('lists children of a specific parent', async () => {
    const { space, closet, drawer } = await setupTree()
    const children = await listChildren(space.id, closet.id)
    expect(children).toHaveLength(1)
    expect(children[0].id).toBe(drawer.id)
  })

  it('cascade-deletes all descendants when a node is deleted', async () => {
    const { space, room } = await setupTree()
    await deleteNode(room.id)
    expect(await db.nodes.where('spaceId').equals(space.id).count()).toBe(0)
  })

  it('only deletes the chosen subtree, not siblings', async () => {
    const space = await createSpace({ name: '내 집' })
    const a = await createNode({
      spaceId: space.id,
      parentId: null,
      name: '안방',
      position: { x: 0, y: 0 },
    })
    const b = await createNode({
      spaceId: space.id,
      parentId: null,
      name: '거실',
      position: { x: 1, y: 0 },
    })
    await createNode({
      spaceId: space.id,
      parentId: b.id,
      name: '소파',
      position: { x: 0, y: 0 },
    })
    await deleteNode(a.id)
    expect(await db.nodes.where('spaceId').equals(space.id).count()).toBe(2)
  })

  it('updates updatedAt on update', async () => {
    const { wallet } = await setupTree()
    const before = wallet.updatedAt
    await new Promise((r) => setTimeout(r, 5))
    await updateNode(wallet.id, { name: '내 지갑' })
    const fresh = await db.nodes.get(wallet.id)
    expect(fresh!.name).toBe('내 지갑')
    expect(fresh!.updatedAt).toBeGreaterThan(before)
  })
})
