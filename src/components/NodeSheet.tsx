import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Drawer } from 'vaul'
import { listCategories } from '../db/categories'
import { createNode, deleteNode, updateNode } from '../db/nodes'
import type { MapNode, Position } from '../types'
import CategoryPicker from './CategoryPicker'
import ColorPalette from './ColorPalette'
import ConfirmDialog from './ConfirmDialog'

export type NodeSheetMode =
  | {
      kind: 'create'
      spaceId: string
      parentId: string | null
      position: Position
    }
  | { kind: 'edit'; node: MapNode }

export default function NodeSheet({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  mode: NodeSheetMode | null
}) {
  return (
    <Drawer.Root open={open && mode !== null} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex max-h-[90vh] flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-3 h-1 w-12 shrink-0 rounded-full bg-neutral-300" />
          <Drawer.Title className="px-5 text-base font-semibold">
            {mode?.kind === 'edit' ? '항목 편집' : '새 항목'}
          </Drawer.Title>
          {open && mode !== null && (
            <NodeFormBody mode={mode} onClose={() => onOpenChange(false)} />
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function NodeFormBody({
  mode,
  onClose,
}: {
  mode: NodeSheetMode
  onClose: () => void
}) {
  const initial = mode.kind === 'edit' ? mode.node : null
  const [step, setStep] = useState<'basic' | 'extras'>('basic')
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState<string | null>(initial?.color ?? null)
  const [category, setCategory] = useState<string | null>(
    initial?.category ?? null,
  )
  const [memo, setMemo] = useState(initial?.memo ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const categories = useLiveQuery(() => listCategories(), [], [])

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const memoTrim = memo.trim()
    if (mode.kind === 'create') {
      await createNode({
        spaceId: mode.spaceId,
        parentId: mode.parentId,
        name: trimmed,
        position: mode.position,
        color,
        category,
        memo: memoTrim.length > 0 ? memoTrim : null,
      })
    } else {
      await updateNode(mode.node.id, {
        name: trimmed,
        color,
        category,
        memo: memoTrim.length > 0 ? memoTrim : null,
      })
    }
    onClose()
  }

  const handleDelete = async () => {
    if (mode.kind !== 'edit') return
    await deleteNode(mode.node.id)
    onClose()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 pt-4 pb-5"
    >
      {step === 'basic' ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 (예: 지갑, 옷장)"
            maxLength={60}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-blue-500"
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            {mode.kind === 'edit' ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg px-3 py-2 text-sm text-red-600 active:bg-red-50"
              >
                삭제
              </button>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-neutral-600 active:bg-neutral-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => setStep('extras')}
                disabled={!canSubmit}
                className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 active:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                저장
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <ColorPalette value={color} onChange={setColor} />
          <CategoryPicker
            categories={categories}
            value={category}
            onChange={setCategory}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-neutral-500">메모</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="자유 메모 (선택)"
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStep('basic')}
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 active:bg-neutral-100"
            >
              ← 이전
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-neutral-600 active:bg-neutral-100"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                저장
              </button>
            </div>
          </div>
        </>
      )}

      {mode.kind === 'edit' && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`"${mode.node.name}"을(를) 삭제할까요?`}
          description="안에 들어 있는 모든 항목이 함께 삭제됩니다. 되돌릴 수 없습니다."
          confirmLabel="삭제"
          onConfirm={handleDelete}
        />
      )}
    </form>
  )
}
