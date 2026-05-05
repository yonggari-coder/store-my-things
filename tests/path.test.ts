import { describe, expect, it } from 'vitest'
import { createNode } from '../src/db/nodes'
import { createSpace } from '../src/db/spaces'
import { buildAncestorPath, getPath } from '../src/lib/path'
import type { MapNode, Space } from '../src/types'

describe('getPath', () => {
  it('returns space + node chain from root to target', async () => {
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
    const path = await getPath(space.id, closet.id)
    expect(path).toHaveLength(3)
    expect(path[0].kind).toBe('space')
    expect(path[1].kind === 'node' && path[1].node.name).toBe('안방')
    expect(path[2].kind === 'node' && path[2].node.name).toBe('옷장')
  })

  it('returns just the space when nodeId is null', async () => {
    const space = await createSpace({ name: '내 집' })
    const path = await getPath(space.id, null)
    expect(path).toHaveLength(1)
    expect(path[0].kind === 'space' && path[0].space.id).toBe(space.id)
  })

  it('returns empty array when space does not exist', async () => {
    const path = await getPath('nonexistent', null)
    expect(path).toEqual([])
  })
})

describe('buildAncestorPath', () => {
  const space: Space = {
    id: 'space1',
    name: '내 집',
    ownerId: 'u',
    createdAt: 0,
    updatedAt: 0,
  }
  const room: MapNode = {
    id: 'room1',
    spaceId: 'space1',
    parentId: null,
    ownerId: 'u',
    name: '안방',
    color: null,
    category: null,
    memo: null,
    position: { x: 0, y: 0 },
    size: { width: 1, height: 1 },
    childGridSize: { width: 4, height: 4 },
    createdAt: 0,
    updatedAt: 0,
  }
  const closet: MapNode = { ...room, id: 'closet1', parentId: 'room1', name: '옷장' }
  const wallet: MapNode = { ...closet, id: 'wallet1', parentId: 'closet1', name: '지갑' }

  it('builds [space, ...ancestors] for a deep node', () => {
    const nodesById = new Map([[room.id, room], [closet.id, closet], [wallet.id, wallet]])
    const spacesById = new Map([[space.id, space]])
    expect(buildAncestorPath(wallet, nodesById, spacesById)).toEqual([
      '내 집',
      '안방',
      '옷장',
    ])
  })

  it('returns just space name for a root-level node', () => {
    const nodesById = new Map([[room.id, room]])
    const spacesById = new Map([[space.id, space]])
    expect(buildAncestorPath(room, nodesById, spacesById)).toEqual(['내 집'])
  })
})
