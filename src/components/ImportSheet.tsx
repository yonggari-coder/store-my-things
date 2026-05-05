import { useState } from 'react'
import { Drawer } from 'vaul'
import type { ExportPayload } from '../types'
import ConfirmDialog from './ConfirmDialog'

export default function ImportSheet({
  open,
  onOpenChange,
  payload,
  onMerge,
  onOverwrite,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  payload: ExportPayload | null
  onMerge: () => Promise<void> | void
  onOverwrite: () => Promise<void> | void
}) {
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)

  const counts = payload
    ? {
        spaces: payload.spaces.length,
        nodes: payload.nodes.length,
        categories: payload.categories.length,
      }
    : null

  return (
    <>
      <Drawer.Root
        open={open && payload !== null}
        onOpenChange={onOpenChange}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto mt-2 mb-3 h-1 w-12 shrink-0 rounded-full bg-neutral-300" />
            <Drawer.Title className="px-5 text-base font-semibold">
              JSON 가져오기
            </Drawer.Title>
            {counts && (
              <Drawer.Description className="mt-2 px-5 text-sm text-neutral-500">
                파일 안 항목: 공간 {counts.spaces}개 · 박스/물건{' '}
                {counts.nodes}개 · 카테고리 {counts.categories}개
              </Drawer.Description>
            )}
            <div className="flex flex-col gap-2 px-5 pt-5 pb-5">
              <button
                type="button"
                onClick={() => onMerge()}
                className="rounded-lg bg-blue-600 py-3 text-sm font-medium text-white active:bg-blue-700"
              >
                병합 — 기존 데이터 유지하고 새 항목만 추가
              </button>
              <button
                type="button"
                onClick={() => setConfirmOverwrite(true)}
                className="rounded-lg border border-red-300 bg-white py-3 text-sm font-medium text-red-600 active:bg-red-50"
              >
                덮어쓰기 — 기존 데이터를 모두 교체
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg bg-neutral-100 py-3 text-sm font-medium text-neutral-700 active:bg-neutral-200"
              >
                취소
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <ConfirmDialog
        open={confirmOverwrite}
        onOpenChange={setConfirmOverwrite}
        title="현재 모든 데이터를 교체할까요?"
        description="기존 공간·박스·물건·카테고리가 모두 삭제되고 파일 내용으로 대체됩니다. 되돌릴 수 없습니다."
        confirmLabel="덮어쓰기"
        onConfirm={onOverwrite}
      />
    </>
  )
}
