import { createNode, deleteNode } from '../db/nodes'
import { updateRootGridSize } from '../db/spaces'
import { db } from '../db'
import type { GridSize, Position } from '../types'

export type TemplateRoom = {
  name: string
  position: Position
  size: GridSize
  color: string
}

export type Template = {
  id: string
  name: string
  description: string
  gridSize: GridSize
  rooms: TemplateRoom[]
}

const C = {
  livingKitchen: '#3b82f6',
  master: '#a855f7',
  room: '#f59e0b',
  smallRoom: '#ec4899',
  bath: '#10b981',
  bathMaster: '#6366f1',
  entry: '#737373',
} as const

export const TEMPLATES: Template[] = [
  {
    id: '24a',
    name: '24A평형',
    description: '2룸 · 거실/주방 중심',
    gridSize: { width: 10, height: 8 },
    rooms: [
      {
        name: '거실/주방',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 5 },
        color: C.livingKitchen,
      },
      {
        name: '안방',
        position: { x: 6, y: 0 },
        size: { width: 4, height: 5 },
        color: C.master,
      },
      {
        name: '작은방',
        position: { x: 0, y: 5 },
        size: { width: 4, height: 3 },
        color: C.smallRoom,
      },
      {
        name: '욕실',
        position: { x: 4, y: 5 },
        size: { width: 3, height: 3 },
        color: C.bath,
      },
      {
        name: '현관',
        position: { x: 7, y: 5 },
        size: { width: 3, height: 3 },
        color: C.entry,
      },
    ],
  },
  {
    id: '24b',
    name: '24B평형',
    description: '1.5룸 · 큰 거실/주방',
    gridSize: { width: 10, height: 8 },
    rooms: [
      {
        name: '거실/주방',
        position: { x: 0, y: 0 },
        size: { width: 7, height: 5 },
        color: C.livingKitchen,
      },
      {
        name: '안방',
        position: { x: 7, y: 0 },
        size: { width: 3, height: 5 },
        color: C.master,
      },
      {
        name: '욕실',
        position: { x: 0, y: 5 },
        size: { width: 3, height: 3 },
        color: C.bath,
      },
      {
        name: '드레스룸',
        position: { x: 3, y: 5 },
        size: { width: 4, height: 3 },
        color: C.smallRoom,
      },
      {
        name: '현관',
        position: { x: 7, y: 5 },
        size: { width: 3, height: 3 },
        color: C.entry,
      },
    ],
  },
  {
    id: '28',
    name: '28평형',
    description: '2.5룸',
    gridSize: { width: 10, height: 9 },
    rooms: [
      {
        name: '거실',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 5 },
        color: C.livingKitchen,
      },
      {
        name: '주방',
        position: { x: 6, y: 0 },
        size: { width: 4, height: 3 },
        color: C.livingKitchen,
      },
      {
        name: '안방',
        position: { x: 6, y: 3 },
        size: { width: 4, height: 6 },
        color: C.master,
      },
      {
        name: '작은방',
        position: { x: 0, y: 5 },
        size: { width: 4, height: 4 },
        color: C.smallRoom,
      },
      {
        name: '욕실',
        position: { x: 4, y: 5 },
        size: { width: 2, height: 4 },
        color: C.bath,
      },
    ],
  },
  {
    id: '32',
    name: '32평형',
    description: '국민평면 · 3룸 + 욕실 2',
    gridSize: { width: 10, height: 10 },
    rooms: [
      {
        name: '거실',
        position: { x: 0, y: 0 },
        size: { width: 5, height: 5 },
        color: C.livingKitchen,
      },
      {
        name: '주방',
        position: { x: 5, y: 0 },
        size: { width: 5, height: 3 },
        color: C.livingKitchen,
      },
      {
        name: '안방',
        position: { x: 5, y: 3 },
        size: { width: 5, height: 4 },
        color: C.master,
      },
      {
        name: '욕실 (안방)',
        position: { x: 5, y: 7 },
        size: { width: 2, height: 3 },
        color: C.bathMaster,
      },
      {
        name: '방 2',
        position: { x: 0, y: 5 },
        size: { width: 3, height: 5 },
        color: C.room,
      },
      {
        name: '방 3',
        position: { x: 3, y: 5 },
        size: { width: 2, height: 5 },
        color: C.smallRoom,
      },
      {
        name: '욕실',
        position: { x: 7, y: 7 },
        size: { width: 3, height: 3 },
        color: C.bath,
      },
    ],
  },
  {
    id: '40',
    name: '40평형',
    description: '4룸 + 욕실 2',
    gridSize: { width: 12, height: 10 },
    rooms: [
      {
        name: '거실',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 5 },
        color: C.livingKitchen,
      },
      {
        name: '주방/식당',
        position: { x: 6, y: 0 },
        size: { width: 6, height: 3 },
        color: C.livingKitchen,
      },
      {
        name: '안방',
        position: { x: 7, y: 3 },
        size: { width: 5, height: 4 },
        color: C.master,
      },
      {
        name: '욕실 (안방)',
        position: { x: 7, y: 7 },
        size: { width: 2, height: 3 },
        color: C.bathMaster,
      },
      {
        name: '방 2',
        position: { x: 0, y: 5 },
        size: { width: 4, height: 5 },
        color: C.room,
      },
      {
        name: '방 3',
        position: { x: 4, y: 5 },
        size: { width: 3, height: 5 },
        color: C.smallRoom,
      },
      {
        name: '욕실',
        position: { x: 9, y: 7 },
        size: { width: 3, height: 3 },
        color: C.bath,
      },
    ],
  },
]

export async function applyTemplate(
  spaceId: string,
  template: Template,
): Promise<void> {
  const existing = await db.nodes
    .where('spaceId')
    .equals(spaceId)
    .filter((n) => n.parentId === null)
    .toArray()
  for (const child of existing) {
    await deleteNode(child.id)
  }
  await updateRootGridSize(spaceId, template.gridSize)
  for (const room of template.rooms) {
    await createNode({
      spaceId,
      parentId: null,
      name: room.name,
      position: room.position,
      size: room.size,
      color: room.color,
    })
  }
}
