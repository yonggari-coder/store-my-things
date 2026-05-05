import { Drawer } from 'vaul'

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  destructive = true,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => Promise<void> | void
}) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-3 h-1 w-12 rounded-full bg-neutral-300" />
          <div className="px-5 pt-1">
            <Drawer.Title className="text-base font-semibold">
              {title}
            </Drawer.Title>
            {description && (
              <Drawer.Description className="mt-1 text-sm text-neutral-500">
                {description}
              </Drawer.Description>
            )}
          </div>
          <div className="flex flex-col gap-2 px-5 pt-5 pb-5">
            <button
              type="button"
              onClick={handleConfirm}
              className={
                destructive
                  ? 'rounded-lg bg-red-600 py-3 text-sm font-medium text-white active:bg-red-700'
                  : 'rounded-lg bg-blue-600 py-3 text-sm font-medium text-white active:bg-blue-700'
              }
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg bg-neutral-100 py-3 text-sm font-medium text-neutral-700 active:bg-neutral-200"
            >
              {cancelLabel}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
