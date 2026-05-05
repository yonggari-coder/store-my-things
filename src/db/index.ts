import Dexie, { type Table } from 'dexie'
import type { Category, MapNode, Space } from '../types'

class WimpDatabase extends Dexie {
  spaces!: Table<Space, string>
  nodes!: Table<MapNode, string>
  categories!: Table<Category, string>

  constructor() {
    super('where_is_my_phone')
    this.version(1).stores({
      spaces: 'id, ownerId, createdAt',
      nodes: 'id, spaceId, parentId, [spaceId+parentId], category, name',
      categories: 'id, ownerId, name, createdAt',
    })
    this.version(2)
      .stores({
        spaces: 'id, ownerId, createdAt',
        nodes: 'id, spaceId, parentId, [spaceId+parentId], category, name',
        categories: 'id, ownerId, name, createdAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('nodes')
          .toCollection()
          .modify((node: MapNode) => {
            if (!node.size) {
              node.size = { width: 1, height: 1 }
            }
          })
      })
  }
}

export const db = new WimpDatabase()
