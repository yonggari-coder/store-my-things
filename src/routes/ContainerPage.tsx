import { useParams } from 'react-router-dom'

export default function ContainerPage() {
  const { spaceId, nodeId } = useParams()
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">격자 뷰</h1>
      <dl className="mt-2 text-sm text-neutral-600">
        <dt className="inline font-medium">spaceId:</dt>
        <dd className="ml-1 inline">{spaceId}</dd>
        <br />
        <dt className="inline font-medium">nodeId:</dt>
        <dd className="ml-1 inline">{nodeId ?? '(루트)'}</dd>
      </dl>
      <p className="mt-3 text-sm text-neutral-500">
        Stage 4부터 격자 + 셀 + breadcrumb를 그립니다.
      </p>
    </div>
  )
}
