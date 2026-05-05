import type { Category } from '../types'
import { generateId } from '../lib/id'
import { LOCAL_OWNER } from '../lib/owner'
import { db } from './index'

export async function listCategories(): Promise<Category[]> {
  return db.categories.orderBy('createdAt').toArray()
}

export async function createCategory(input: {
  name: string
  color?: string | null
}): Promise<Category> {
  const cat: Category = {
    id: generateId(),
    name: input.name,
    color: input.color ?? null,
    isBuiltIn: false,
    ownerId: LOCAL_OWNER,
    createdAt: Date.now(),
  }
  await db.categories.add(cat)
  return cat
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, 'name' | 'color'>>,
): Promise<void> {
  await db.categories.update(id, patch)
}

export async function deleteCategory(id: string): Promise<void> {
  await db.transaction('rw', db.categories, db.nodes, async () => {
    await db.nodes.where('category').equals(id).modify({ category: null })
    await db.categories.delete(id)
  })
}
