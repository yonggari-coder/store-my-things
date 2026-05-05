import { db } from '../db'
import type { Category, ExportPayload, MapNode, Space } from '../types'

export const EXPORT_VERSION = 1

export type ImportMode = 'overwrite' | 'merge'

export type ImportResult = {
  spacesAdded: number
  nodesAdded: number
  categoriesAdded: number
  spacesSkipped: number
  nodesSkipped: number
  categoriesSkipped: number
}

export async function exportToPayload(): Promise<ExportPayload> {
  const [spaces, nodes, categories] = await Promise.all([
    db.spaces.toArray(),
    db.nodes.toArray(),
    db.categories.toArray(),
  ])
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    spaces,
    nodes,
    categories,
  }
}

export function downloadPayload(
  payload: ExportPayload,
  filename?: string,
): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = filename ?? `where-is-my-phone-${date}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportToFile(): Promise<void> {
  const payload = await exportToPayload()
  downloadPayload(payload)
}

export function parsePayload(json: string): ExportPayload {
  let obj: unknown
  try {
    obj = JSON.parse(json)
  } catch {
    throw new Error('JSON 형식이 아닙니다.')
  }
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('JSON 객체가 아닙니다.')
  }
  const o = obj as Record<string, unknown>
  if (typeof o.version !== 'number') {
    throw new Error('version 필드가 없습니다.')
  }
  if (o.version !== EXPORT_VERSION) {
    throw new Error(
      `지원하지 않는 버전입니다 (파일: ${String(o.version)}, 앱: ${EXPORT_VERSION})`,
    )
  }
  if (
    !Array.isArray(o.spaces) ||
    !Array.isArray(o.nodes) ||
    !Array.isArray(o.categories)
  ) {
    throw new Error('spaces / nodes / categories 배열이 누락되었습니다.')
  }
  return {
    version: EXPORT_VERSION,
    exportedAt: typeof o.exportedAt === 'string' ? o.exportedAt : '',
    spaces: o.spaces as Space[],
    nodes: o.nodes as MapNode[],
    categories: o.categories as Category[],
  }
}

export async function importPayload(
  payload: ExportPayload,
  mode: ImportMode,
): Promise<ImportResult> {
  const result: ImportResult = {
    spacesAdded: 0,
    nodesAdded: 0,
    categoriesAdded: 0,
    spacesSkipped: 0,
    nodesSkipped: 0,
    categoriesSkipped: 0,
  }

  await db.transaction(
    'rw',
    db.spaces,
    db.nodes,
    db.categories,
    async () => {
      if (mode === 'overwrite') {
        await Promise.all([
          db.spaces.clear(),
          db.nodes.clear(),
          db.categories.clear(),
        ])
        await db.spaces.bulkAdd(payload.spaces)
        await db.nodes.bulkAdd(payload.nodes)
        await db.categories.bulkAdd(payload.categories)
        result.spacesAdded = payload.spaces.length
        result.nodesAdded = payload.nodes.length
        result.categoriesAdded = payload.categories.length
      } else {
        const existingSpaceIds = new Set(
          (await db.spaces.toCollection().primaryKeys()) as string[],
        )
        const existingNodeIds = new Set(
          (await db.nodes.toCollection().primaryKeys()) as string[],
        )
        const existingCatIds = new Set(
          (await db.categories.toCollection().primaryKeys()) as string[],
        )

        const newSpaces = payload.spaces.filter(
          (s) => !existingSpaceIds.has(s.id),
        )
        const newNodes = payload.nodes.filter(
          (n) => !existingNodeIds.has(n.id),
        )
        const newCats = payload.categories.filter(
          (c) => !existingCatIds.has(c.id),
        )

        await db.spaces.bulkAdd(newSpaces)
        await db.nodes.bulkAdd(newNodes)
        await db.categories.bulkAdd(newCats)

        result.spacesAdded = newSpaces.length
        result.nodesAdded = newNodes.length
        result.categoriesAdded = newCats.length
        result.spacesSkipped = payload.spaces.length - newSpaces.length
        result.nodesSkipped = payload.nodes.length - newNodes.length
        result.categoriesSkipped =
          payload.categories.length - newCats.length
      }
    },
  )

  return result
}
