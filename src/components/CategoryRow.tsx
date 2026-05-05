import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { deleteCategory, updateCategory } from '../db/categories'
import type { Category } from '../types'
import ActionSheet from './ActionSheet'
import CategoryFormSheet from './CategoryFormSheet'
import ConfirmDialog from './ConfirmDialog'

export default function CategoryRow({ category }: { category: Category }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const dot = category.color ?? '#a3a3a3'

  return (
    <>
      <li className="flex items-center px-4 py-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
          aria-hidden
        />
        <span className="ml-3 flex-1 truncate text-base">{category.name}</span>
        {category.isBuiltIn && (
          <span className="mr-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
            기본
          </span>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={`${category.name} 메뉴`}
          className="flex h-8 w-8 items-center justify-center text-neutral-400 active:bg-neutral-100"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </li>

      <ActionSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={category.name}
        items={[
          {
            label: '이름·색 변경',
            icon: <Pencil className="h-5 w-5 text-neutral-500" />,
            onClick: () => {
              setMenuOpen(false)
              setEditOpen(true)
            },
          },
          {
            label: category.isBuiltIn ? '삭제 (기본 카테고리는 삭제 불가)' : '삭제',
            icon: <Trash2 className="h-5 w-5" />,
            destructive: !category.isBuiltIn,
            disabled: category.isBuiltIn,
            onClick: () => {
              setMenuOpen(false)
              setDeleteOpen(true)
            },
          },
        ]}
      />

      <CategoryFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title="카테고리 편집"
        initial={{ name: category.name, color: category.color }}
        submitLabel="저장"
        onSubmit={({ name, color }) =>
          updateCategory(category.id, { name, color })
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`"${category.name}" 카테고리를 삭제할까요?`}
        description="이 카테고리를 사용 중인 항목들의 카테고리는 비워집니다."
        confirmLabel="삭제"
        onConfirm={() => deleteCategory(category.id)}
      />
    </>
  )
}
