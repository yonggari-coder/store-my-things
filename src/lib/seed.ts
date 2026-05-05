import { db } from '../db'
import type { Category } from '../types'
import { generateId } from './id'

const BUILT_IN_CATEGORIES: ReadonlyArray<Pick<Category, 'name' | 'color'>> = [
  { name: '전자기기', color: '#3b82f6' },
  { name: '문구', color: '#f59e0b' },
  { name: '의류', color: '#a855f7' },
  { name: '식품', color: '#ef4444' },
  { name: '도구', color: '#10b981' },
  { name: '서류', color: '#6366f1' },
  { name: '약·위생', color: '#ec4899' },
  { name: '기타', color: '#737373' },
]

export async function seedBuiltInCategoriesIfEmpty(): Promise<void> {
  const count = await db.categories.count()
  if (count > 0) return
  const now = Date.now()
  const records: Category[] = BUILT_IN_CATEGORIES.map((c) => ({
    id: generateId(),
    name: c.name,
    color: c.color,
    isBuiltIn: true,
    ownerId: null,
    createdAt: now,
  }))
  await db.categories.bulkAdd(records)
}
