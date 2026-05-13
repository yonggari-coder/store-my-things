import { Drawer } from 'vaul'
import { TEMPLATES, type Template } from '../lib/templates'

export default function PresetSheet({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  onApply: (template: Template) => void
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-20 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 flex max-h-[80vh] flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mt-2 mb-2 h-1 w-12 rounded-full bg-neutral-300" />
          <Drawer.Title className="px-5 pt-2 text-base font-semibold">
            기본 평형 선택
          </Drawer.Title>
          <Drawer.Description className="px-5 pt-0.5 text-xs text-neutral-400">
            현재 공간의 구획을 모두 지우고 선택한 평형으로 채웁니다.
          </Drawer.Description>
          <ul className="flex flex-col gap-2 overflow-y-auto px-5 py-3">
            {TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onApply(t)}
                  className="flex w-full items-start gap-3 rounded-lg border border-neutral-200 p-3 text-left active:bg-neutral-100"
                >
                  <PreviewGrid template={t} />
                  <div className="flex flex-1 flex-col">
                    <span className="text-base font-medium">{t.name}</span>
                    <span className="text-xs text-neutral-500">
                      {t.description}
                    </span>
                    <span className="mt-0.5 text-[11px] text-neutral-400">
                      {t.gridSize.width}×{t.gridSize.height} 그리드 ·{' '}
                      {t.rooms.length}개 구획
                    </span>
                  </div>
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

function PreviewGrid({ template }: { template: Template }) {
  return (
    <div
      className="flex-shrink-0"
      style={{
        display: 'grid',
        width: 72,
        height: 72,
        gridTemplateColumns: `repeat(${template.gridSize.width}, 1fr)`,
        gridTemplateRows: `repeat(${template.gridSize.height}, 1fr)`,
        gap: 1,
        background: '#e5e5e5',
        border: '1px solid #d4d4d4',
        borderRadius: 4,
        padding: 2,
      }}
      aria-hidden
    >
      {template.rooms.map((r, i) => (
        <div
          key={i}
          style={{
            gridColumn: `${r.position.x + 1} / span ${r.size.width}`,
            gridRow: `${r.position.y + 1} / span ${r.size.height}`,
            background: r.color,
            opacity: 0.85,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}
