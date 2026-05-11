import { useLiveQuery } from 'dexie-react-hooks'
import { MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../db'
import { deleteSpace, updateSpace } from '../db/spaces'
import type { Space } from '../types'
import ConfirmDialog from './ConfirmDialog'
import SpaceFormSheet from './SpaceFormSheet'
import SpaceMenuSheet from './SpaceMenuSheet'

export default function SpaceCard({ space }: { space: Space }) {
  const itemCount = useLiveQuery(
    () => db.nodes.where('spaceId').equals(space.id).count(),
    [space.id],
    0,
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <li className="flex items-center rounded-xl border border-neutral-200 bg-white">
        <Link
          to={`/app/s/${space.id}`}
          className="flex flex-1 flex-col gap-0.5 px-4 py-3 active:bg-neutral-50"
        >
          <h2 className="text-base font-medium">{space.name}</h2>
          <p className="text-xs text-neutral-500">{itemCount}개 항목</p>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={`${space.name} 메뉴`}
          className="flex h-12 w-12 items-center justify-center text-neutral-400 active:bg-neutral-100"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </li>

      <SpaceMenuSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        spaceName={space.name}
        onRename={() => {
          setMenuOpen(false)
          setEditOpen(true)
        }}
        onDelete={() => {
          setMenuOpen(false)
          setDeleteOpen(true)
        }}
      />

      <SpaceFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title="공간 이름 변경"
        initialName={space.name}
        submitLabel="저장"
        onSubmit={({ name }) => updateSpace(space.id, { name })}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`"${space.name}" 공간을 삭제할까요?`}
        description="공간 안의 모든 박스와 물건이 함께 삭제됩니다. 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={() => deleteSpace(space.id)}
      />
    </>
  )
}
