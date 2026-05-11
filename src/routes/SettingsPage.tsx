import { ChevronRight, Download, Tag, Upload, X } from 'lucide-react'
import type { ChangeEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ImportSheet from '../components/ImportSheet'
import {
  exportToFile,
  importPayload,
  parsePayload,
} from '../lib/exportImport'
import type { ExportPayload } from '../types'
import type { ImportResult } from '../lib/exportImport'

type Notice =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

export default function SettingsPage() {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [pending, setPending] = useState<ExportPayload | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      await exportToFile()
      setNotice({ kind: 'success', message: 'JSON 파일을 내보냈습니다.' })
    } catch (err) {
      setNotice({
        kind: 'error',
        message: err instanceof Error ? err.message : '내보내기 실패',
      })
    }
  }

  const handlePickFile = () => {
    setNotice(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const payload = parsePayload(text)
      setPending(payload)
      setSheetOpen(true)
    } catch (err) {
      setNotice({
        kind: 'error',
        message: `가져오기 실패: ${err instanceof Error ? err.message : String(err)}`,
      })
    }
  }

  const finishImport = async (mode: 'merge' | 'overwrite') => {
    if (!pending) return
    try {
      const result = await importPayload(pending, mode)
      setNotice({
        kind: 'success',
        message: formatResult(mode, result),
      })
      setSheetOpen(false)
      setPending(null)
    } catch (err) {
      setNotice({
        kind: 'error',
        message: `가져오기 실패: ${err instanceof Error ? err.message : String(err)}`,
      })
      setSheetOpen(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h1 className="px-4 pt-4 pb-3 text-xl font-semibold">설정</h1>

      {notice && (
        <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />
      )}

      <Section title="콘텐츠">
        <SettingLink
          to="/app/settings/categories"
          icon={<Tag className="h-4 w-4 text-neutral-500" />}
          label="카테고리 관리"
        />
      </Section>

      <Section title="데이터">
        <button
          type="button"
          onClick={handleExport}
          className="flex w-full items-center gap-3 px-4 py-3 active:bg-neutral-50"
        >
          <Download className="h-4 w-4 text-neutral-500" />
          <span className="flex-1 text-left text-sm">JSON 내보내기</span>
        </button>
        <button
          type="button"
          onClick={handlePickFile}
          className="flex w-full items-center gap-3 border-t border-neutral-100 px-4 py-3 active:bg-neutral-50"
        >
          <Upload className="h-4 w-4 text-neutral-500" />
          <span className="flex-1 text-left text-sm">JSON 가져오기</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileChange}
        />
      </Section>

      <Section title="정보">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm">버전</span>
          <span className="text-sm text-neutral-500">0.1.0</span>
        </div>
      </Section>

      <ImportSheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next)
          if (!next) setPending(null)
        }}
        payload={pending}
        onMerge={() => finishImport('merge')}
        onOverwrite={() => finishImport('overwrite')}
      />
    </div>
  )
}

function NoticeBanner({
  notice,
  onDismiss,
}: {
  notice: Notice
  onDismiss: () => void
}) {
  const tone =
    notice.kind === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-700'
  return (
    <div className={`mx-4 mb-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${tone}`}>
      <span className="flex-1 break-words">{notice.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="닫기"
        className="text-current/60 active:opacity-70"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function formatResult(
  mode: 'merge' | 'overwrite',
  r: ImportResult,
): string {
  if (mode === 'overwrite') {
    return `덮어쓰기 완료 — 공간 ${r.spacesAdded}개 · 박스/물건 ${r.nodesAdded}개 · 카테고리 ${r.categoriesAdded}개`
  }
  const skipped =
    r.spacesSkipped + r.nodesSkipped + r.categoriesSkipped
  return `병합 완료 — 추가 ${r.spacesAdded + r.nodesAdded + r.categoriesAdded}개 (이미 있던 ${skipped}개는 건너뜀)`
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mb-6">
      <h2 className="px-4 pb-1 text-xs font-medium tracking-wide text-neutral-400 uppercase">
        {title}
      </h2>
      <div className="border-y border-neutral-200 bg-white">{children}</div>
    </section>
  )
}

function SettingLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 active:bg-neutral-50"
    >
      {icon}
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-neutral-400" />
    </Link>
  )
}
