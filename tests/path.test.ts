import { describe, expect, it } from 'vitest'
import { createNode } from '../src/db/nodes'
import { createSpace } from '../src/db/spaces'
import { getPath } from '../src/lib/path'

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
