import { Pencil, Trash2 } from 'lucide-react'
import { Drawer } from 'vaul'

export default function CellMenuSheet({
  open,
  onOpenChange,
  nodeName,
  onEdit,
  onDelete,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  nodeName: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-2 h-1 w-12 rounded-full bg-neutral-300" />
          <Drawer.Title className="px-5 pt-2 text-sm text-neutral-500">
            {nodeName}
          </Drawer.Title>
          <ul className="flex flex-col py-2">
            <li>
              <button
                type="button"
                onClick={onEdit}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-base active:bg-neutral-100"
              >
                <Pencil className="h-5 w-5 text-neutral-500" />
                편집
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-base text-red-600 active:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
                삭제
              </button>
            </li>
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
