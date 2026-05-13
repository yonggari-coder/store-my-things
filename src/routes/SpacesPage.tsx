import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import Fab from '../components/Fab'
import SpaceCard from '../components/SpaceCard'
import SpaceFormSheet from '../components/SpaceFormSheet'
import { createSpace, listSpaces } from '../db/spaces'

export default function SpacesPage() {
  const spaces = useLiveQuery(() => listSpaces())
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()

  if (spaces === undefined) {
    return <div className="p-4 text-sm text-neutral-400">불러오는 중…</div>
  }

  return (
    <>
      {spaces.length === 0 ? (
        <EmptyState
          title="아직 만든 공간이 없습니다"
          description="첫 공간을 만들고 그 안에 방·가구·물건을 차곡차곡 추가해보세요."
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white active:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> 새 공간 만들기
            </button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2 p-4 pb-24">
          {spaces.map((s) => (
            <SpaceCard key={s.id} space={s} />
          ))}
        </ul>
      )}

      {spaces.length > 0 && (
        <Fab onClick={() => setCreateOpen(true)}>
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">새 공간</span>
        </Fab>
      )}

      <SpaceFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="새 공간 만들기"
        submitLabel="직접 만들기"
        onSubmit={async ({ name }) => {
          await createSpace({ name })
        }}
        secondarySubmitLabel="집 구조 세팅하기"
        onSecondarySubmit={async ({ name }) => {
          const space = await createSpace({ name })
          navigate(`/app/s/${space.id}?draw=1`)
        }}
      />
    </>
  )
}
