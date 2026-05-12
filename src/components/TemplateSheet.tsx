import { LayoutGrid, Pencil } from 'lucide-react'
import { Drawer } from 'vaul'

export default function TemplateSheet({
  open,
  onOpenChange,
  onDraw,
  onPreset,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  onDraw: () => void
  onPreset: () => void
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-2 h-1 w-12 rounded-full bg-neutral-300" />
          <Drawer.Title className="px-5 pt-2 text-sm text-neutral-500">
            템플릿
          </Drawer.Title>
          <Drawer.Description className="px-5 pt-0.5 text-xs text-neutral-400">
            처음 집 구조를 어떻게 만들지 골라.
          </Drawer.Description>
          <ul className="flex flex-col py-3">
            <li>
              <button
                type="button"
                onClick={onDraw}
                className="flex w-full items-start gap-3 px-5 py-3 text-left active:bg-neutral-100"
              >
                <Pencil className="mt-0.5 h-5 w-5 text-neutral-500" />
                <span className="flex flex-col">
                  <span className="text-base">집 구조 그리기</span>
                  <span className="text-xs text-neutral-500">
                    빈 그리드에 직접 구획을 그려 방을 만든다
                  </span>
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onPreset}
                className="flex w-full items-start gap-3 px-5 py-3 text-left active:bg-neutral-100"
              >
                <LayoutGrid className="mt-0.5 h-5 w-5 text-neutral-500" />
                <span className="flex flex-col">
                  <span className="text-base">기본 템플릿 사용하기</span>
                  <span className="text-xs text-neutral-500">
                    미리 만들어진 집 구조에서 고른다
                  </span>
                </span>
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
