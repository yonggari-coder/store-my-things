import { describe, expect, it } from 'vitest'
import { db } from '../src/db'
import { seedBuiltInCategoriesIfEmpty } from '../src/lib/seed'

describe('seedBuiltInCategoriesIfEmpty', () => {
  it('seeds 8 built-in categories on first run', async () => {
    await seedBuiltInCategoriesIfEmpty()
    const cats = await db.categories.toArray()
    expect(cats).toHaveLength(8)
    expect(cats.every((c) => c.isBuiltIn)).toBe(true)
    expect(cats.map((c) => c.name)).toContain('전자기기')
    expect(cats.map((c) => c.name)).toContain('기타')
  })

  it('does not duplicate on second run', async () => {
    await seedBuiltInCategoriesIfEmpty()
    await seedBuiltInCategoriesIfEmpty()
    expect(await db.categories.count()).toBe(8)
  })
})
