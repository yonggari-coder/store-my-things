import { describe, expect, it } from 'vitest'
import { db } from '../src/db'
import { createCategory } from '../src/db/categories'
import { createNode } from '../src/db/nodes'
import { createSpace } from '../src/db/spaces'
import {
  EXPORT_VERSION,
  exportToPayload,
  importPayload,
  parsePayload,
} from '../src/lib/exportImport'

describe('exportToPayload', () => {
  it('serializes all tables into a versioned payload', async () => {
    const space = await createSpace({ name: '내 집' })
    await createNode({
      spaceId: space.id,
      parentId: null,
      name: '거실',
      position: { x: 0, y: 0 },
    })
    await createCategory({ name: '커스텀', color: '#000' })

    const payload = await exportToPayload()
    expect(payload.version).toBe(EXPORT_VERSION)
    expect(payload.spaces).toHaveLength(1)
    expect(payload.nodes).toHaveLength(1)
    expect(payload.categories).toHaveLength(1)
    expect(typeof payload.exportedAt).toBe('string')
  })
})

describe('parsePayload', () => {
  it('round-trips a serialized payload', () => {
    const json = JSON.stringify({
      version: EXPORT_VERSION,
      exportedAt: '2026-05-05T00:00:00.000Z',
      spaces: [],
      nodes: [],
      categories: [],
    })
    const parsed = parsePayload(json)
    expect(parsed.spaces).toEqual([])
  })

  it('rejects bad JSON', () => {
    expect(() => parsePayload('not json')).toThrow()
  })

  it('rejects unsupported versions', () => {
    const json = JSON.stringify({
      version: 999,
      spaces: [],
      nodes: [],
      categories: [],
    })
    expect(() => parsePayload(json)).toThrow(/지원하지 않는 버전/)
  })

  it('rejects payloads missing required arrays', () => {
    const json = JSON.stringify({ version: EXPORT_VERSION })
    expect(() => parsePayload(json)).toThrow(/누락/)
  })
})

describe('importPayload — overwrite', () => {
  it('replaces all existing data', async () => {
    const original = await createSpace({ name: '원본 공간' })
    await createNode({
      spaceId: original.id,
      parentId: null,
      name: '원본 노드',
      position: { x: 0, y: 0 },
    })

    const payload = await exportToPayload()
    payload.spaces = [
      {
        id: 'new-space',
        name: '교체된 공간',
        ownerId: 'u',
        createdAt: 1,
        updatedAt: 1,
      },
    ]
    payload.nodes = []
    payload.categories = []

    const result = await importPayload(payload, 'overwrite')
    expect(result.spacesAdded).toBe(1)
    expect(await db.spaces.count()).toBe(1)
    expect((await db.spaces.toArray())[0].name).toBe('교체된 공간')
    expect(await db.nodes.count()).toBe(0)
  })
})

describe('importPayload — merge', () => {
  it('skips existing ids and adds only new ones', async () => {
    const existing = await createSpace({ name: '기존 공간' })

    const payload = await exportToPayload()
    payload.spaces = [
      // same id as existing → should be skipped
      {
        id: existing.id,
        name: '같은 id 다른 이름',
        ownerId: 'u',
        createdAt: 1,
        updatedAt: 1,
      },
      // new id
      {
        id: 'new-id',
        name: '신규 공간',
        ownerId: 'u',
        createdAt: 2,
        updatedAt: 2,
      },
    ]

    const result = await importPayload(payload, 'merge')
    expect(result.spacesAdded).toBe(1)
    expect(result.spacesSkipped).toBe(1)
    const all = await db.spaces.toArray()
    expect(all).toHaveLength(2)
    // existing keeps its original name (was not overwritten)
    expect(all.find((s) => s.id === existing.id)?.name).toBe('기존 공간')
    expect(all.find((s) => s.id === 'new-id')?.name).toBe('신규 공간')
  })
})
