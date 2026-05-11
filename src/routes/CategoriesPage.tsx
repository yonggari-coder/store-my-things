import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryFormSheet from '../components/CategoryFormSheet'
import CategoryRow from '../components/CategoryRow'
import Fab from '../components/Fab'
import { createCategory, listCategories } from '../db/categories'

export default function CategoriesPage() {
  const categories = useLiveQuery(() => listCategories())
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <header className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Link
          to="/app/settings"
          className="flex h-8 w-8 items-center justify-center text-neutral-500 active:bg-neutral-100"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">카테고리</h1>
      </header>

      {categories === undefined ? (
        <div className="p-4 text-sm text-neutral-400">불러오는 중…</div>
      ) : (
        <ul className="divide-y divide-neutral-100 border-y border-neutral-200 bg-white pb-24">
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </ul>
      )}

      <Fab onClick={() => setCreateOpen(true)}>
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">새 카테고리</span>
      </Fab>

      <CategoryFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="새 카테고리"
        submitLabel="만들기"
        onSubmit={({ name, color }) => createCategory({ name, color })}
      />
    </>
  )
}
