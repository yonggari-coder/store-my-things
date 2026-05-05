import { db } from '../db'
import type { MapNode } from '../types'

export async function searchNodes(
  spaceId: string,
  query: string,
  limit = 50,
): Promise<MapNode[]> {
  const q = query.trim().toLowerCase()
  if (q === '') return []
  return db.nodes
    .where('spaceId')
    .equals(spaceId)
    .filter((n) => {
      const inName = n.name.toLowerCase().includes(q)
      const inMemo = n.memo?.toLowerCase().includes(q) ?? false
      return inName || inMemo
    })
    .limit(limit)
    .toArray()
}
