import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <Link
        to="/app"
        className="mt-3 inline-block text-sm text-blue-600 hover:underline"
      >
        ← 공간 목록으로
      </Link>
    </div>
  )
}
