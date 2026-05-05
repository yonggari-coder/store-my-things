import type { ReactNode } from 'react'
import { Drawer } from 'vaul'

export type ActionItem = {
  label: string
  icon?: ReactNode
  destructive?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function ActionSheet({
  open,
  onOpenChange,
  title,
  items,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  title?: string
  items: ActionItem[]
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-2 h-1 w-12 rounded-full bg-neutral-300" />
          {title && (
            <Drawer.Title className="px-5 pt-2 text-sm text-neutral-500">
              {title}
            </Drawer.Title>
          )}
          <ul className="flex flex-col py-2">
            {items.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={
                    item.disabled
                      ? 'flex w-full cursor-not-allowed items-center gap-3 px-5 py-3 text-left text-base text-neutral-400'
                      : item.destructive
                        ? 'flex w-full items-center gap-3 px-5 py-3 text-left text-base text-red-600 active:bg-red-50'
                        : 'flex w-full items-center gap-3 px-5 py-3 text-left text-base text-neutral-900 active:bg-neutral-100'
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="px-5 pt-1 pb-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-lg bg-neutral-100 py-3 text-sm font-medium text-neutral-700 active:bg-neutral-200"
            >
              취소
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
