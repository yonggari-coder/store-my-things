import { useState } from 'react'
import type { FormEvent } from 'react'
import { Drawer } from 'vaul'

export type SpaceFormResult = { name: string }

export default function SpaceFormSheet({
  open,
  onOpenChange,
  title,
  initialName,
  submitLabel,
  onSubmit,
  secondarySubmitLabel,
  onSecondarySubmit,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  title: string
  initialName?: string
  submitLabel: string
  onSubmit: (result: SpaceFormResult) => Promise<unknown> | void
  secondarySubmitLabel?: string
  onSecondarySubmit?: (result: SpaceFormResult) => Promise<unknown> | void
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-4 h-1 w-12 rounded-full bg-neutral-300" />
          <Drawer.Title className="px-5 text-base font-semibold">
            {title}
          </Drawer.Title>
          {open && (
            <FormBody
              initialName={initialName}
              submitLabel={submitLabel}
              onSubmit={async (result) => {
                await onSubmit(result)
                onOpenChange(false)
              }}
              secondarySubmitLabel={secondarySubmitLabel}
              onSecondarySubmit={
                onSecondarySubmit
                  ? async (result) => {
                      await onSecondarySubmit(result)
                      onOpenChange(false)
                    }
                  : undefined
              }
              onCancel={() => onOpenChange(false)}
            />
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function FormBody({
  initialName,
  submitLabel,
  onSubmit,
  secondarySubmitLabel,
  onSecondarySubmit,
  onCancel,
}: {
  initialName?: string
  submitLabel: string
  onSubmit: (result: SpaceFormResult) => Promise<void>
  secondarySubmitLabel?: string
  onSecondarySubmit?: (result: SpaceFormResult) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initialName ?? '')

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    await onSubmit({ name: trimmed })
  }

  const handleSecondary = async () => {
    if (!canSubmit || !onSecondarySubmit) return
    await onSecondarySubmit({ name: trimmed })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 px-5">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 내 집"
        maxLength={40}
        autoFocus
        className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-blue-500"
      />
      <div className="mt-2 flex flex-wrap justify-end gap-2 pb-5">
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
        {secondarySubmitLabel && onSecondarySubmit && (
          <button
            type="button"
            onClick={handleSecondary}
            disabled={!canSubmit}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {secondarySubmitLabel}
          </button>
        )}
      </div>
    </form>
  )
}
