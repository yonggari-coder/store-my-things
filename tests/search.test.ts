import { describe, expect, it } from 'vitest'
import { createNode } from '../src/db/nodes'
import { createSpace } from '../src/db/spaces'
import { searchNodes } from '../src/lib/search'

describe('searchNodes', () => {
  it('finds by name (case-insensitive partial)', async () => {
    const space = await createSpace({ name: '내 집' })
    await createNode({
      spaceId: space.id,
      parentId: null,
      name: '충전기',
      position: { x: 0, y: 0 },
    })
    await createNode({
      spaceId: space.id,
      parentId: null,
      name: '책',
      position: { x: 1, y: 0 },
    })
    const results = await searchNodes(space.id, '충전')
    expect(results.map((n) => n.name)).toEqual(['충전기'])
  })

  it('finds by memo', async () => {
    const space = await createSpace({ name: '내 집' })
    await createNode({
      spaceId: space.id,
      parentId: null,
      name: '상자',
      memo: '여름용 옷 보관',
      position: { x: 0, y: 0 },
    })
    const results = await searchNodes(space.id, '여름')
    expect(results).toHaveLength(1)
  })

  it('does not leak across spaces', async () => {
    const home = await createSpace({ name: '내 집' })
    const office = await createSpace({ name: '사무실' })
    await createNode({
      spaceId: home.id,
      parentId: null,
      name: '지갑',
      position: { x: 0, y: 0 },
    })
    const results = await searchNodes(office.id, '지갑')
    expect(results).toHaveLength(0)
  })

  it('returns empty for empty/whitespace query', async () => {
    const space = await createSpace({ name: '내 집' })
    expect(await searchNodes(space.id, '')).toEqual([])
    expect(await searchNodes(space.id, '   ')).toEqual([])
  })
})
