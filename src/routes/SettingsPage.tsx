import { ChevronRight, Tag } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <h1 className="px-4 pt-4 pb-3 text-xl font-semibold">설정</h1>

      <Section title="콘텐츠">
        <SettingLink
          to="/settings/categories"
          icon={<Tag className="h-4 w-4 text-neutral-500" />}
          label="카테고리 관리"
        />
      </Section>

      <Section title="데이터">
        <div className="px-4 py-3 text-sm text-neutral-400">
          JSON 내보내기/가져오기는 다음 단계(Stage 9)에서 추가됩니다.
        </div>
      </Section>

      <Section title="정보">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm">버전</span>
          <span className="text-sm text-neutral-500">0.1.0</span>
        </div>
      </Section>
    </div>
  )
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
