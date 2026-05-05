import 'fake-indexeddb/auto'
import { beforeEach } from 'vitest'
import { db } from '../src/db'

beforeEach(async () => {
  await Promise.all([
    db.nodes.clear(),
    db.spaces.clear(),
    db.categories.clear(),
  ])
})
