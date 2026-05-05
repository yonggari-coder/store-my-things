import { db } from '../db'
import type { MapNode } from '../types'
import { generateId } from './id'
import { LOCAL_OWNER } from './owner'

export async function seedDemoNodes(spaceId: string): Promise<void> {
  const now = Date.now()
  const make = (
    parentId: string | null,
    name: string,
    x: number,
    y: number,
    color: string | null = null,
  ): MapNode => ({
    id: generateId(),
    spaceId,
    parentId,
    ownerId: LOCAL_OWNER,
    name,
    color,
    category: null,
    memo: null,
    position: { x, y },
    size: { width: 1, height: 1 },
    childGridSize: { width: 4, height: 4 },
    createdAt: now,
    updatedAt: now,
  })

  const livingRoom = make(null, '거실', 0, 0, '#3b82f6')
  const bedroom = make(null, '안방', 1, 0, '#a855f7')
  const kitchen = make(null, '주방', 0, 1, '#10b981')

  const sofa = make(livingRoom.id, '소파', 0, 0, '#3b82f6')
  const tvStand = make(livingRoom.id, 'TV 장', 1, 0, '#3b82f6')

  const closet = make(bedroom.id, '옷장', 0, 0, '#a855f7')

  const drawerTop = make(closet.id, '위 서랍', 0, 0, '#a855f7')
  const wallet = make(drawerTop.id, '지갑', 0, 0)
  const charger = make(drawerTop.id, '충전기', 1, 0)

  await db.nodes.bulkAdd([
    livingRoom,
    bedroom,
    kitchen,
    sofa,
    tvStand,
    closet,
    drawerTop,
    wallet,
    charger,
  ])
}
