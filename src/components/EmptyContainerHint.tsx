import { useState } from 'react'
import { seedDemoNodes } from '../lib/demoSeed'

export default function EmptyContainerHint({
  spaceId,
  isRoot,
}: {
  spaceId: string
  isRoot: boolean
}) {
  const [seeding, setSeeding] = useState(false)

  if (!isRoot) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-neutral-400">
        이 안이 비어 있습니다.
      </div>
    )
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedDemoNodes(spaceId)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm text-neutral-500">이 공간이 비어 있습니다.</p>
      <button
        type="button"
        onClick={handleSeed}
        disabled={seeding}
        className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:bg-neutral-300"
      >
        {seeding ? '추가하는 중…' : '예시 데이터로 시작'}
      </button>
      <p className="max-w-xs text-xs text-neutral-400">
        거실·안방·주방 등 샘플 구조를 한 번에 생성합니다. 다음 단계(Stage 5)에서
        직접 추가도 가능해질 예정입니다.
      </p>
    </div>
  )
}
