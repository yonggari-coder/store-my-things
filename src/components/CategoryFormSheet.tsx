import { useState } from 'react'
import type { FormEvent } from 'react'
import { Drawer } from 'vaul'
import ColorPalette from './ColorPalette'

export type CategoryFormResult = {
  name: string
  color: string | null
}

export default function CategoryFormSheet({
  open,
  onOpenChange,
  title,
  initial,
  submitLabel,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  title: string
  initial?: { name: string; color: string | null }
  submitLabel: string
  onSubmit: (result: CategoryFormResult) => Promise<unknown> | void
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-3 h-1 w-12 shrink-0 rounded-full bg-neutral-300" />
          <Drawer.Title className="px-5 text-base font-semibold">
            {title}
          </Drawer.Title>
          {open && (
            <FormBody
              initial={initial}
              submitLabel={submitLabel}
              onSubmit={async (result) => {
                await onSubmit(result)
                onOpenChange(false)
              }}
              onCancel={() => onOpenChange(false)}
            />
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function FormBody({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: { name: string; color: string | null }
  submitLabel: string
  onSubmit: (result: CategoryFormResult) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState<string | null>(initial?.color ?? null)

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await onSubmit({ name: trimmed, color })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-4 px-5 pb-5"
    >
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 화장품"
        maxLength={30}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-blue-500"
      />
      <ColorPalette value={color} onChange={setColor} />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-neutral-600 active:bg-neutral-100"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
