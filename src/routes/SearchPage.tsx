import { useLiveQuery } from 'dexie-react-hooks'
import { Search, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import SearchResultRow from '../components/SearchResultRow'
import { db } from '../db'
import { buildAncestorPath } from '../lib/path'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const data = useLiveQuery(async () => {
    const [spaces, nodes] = await Promise.all([
      db.spaces.toArray(),
      db.nodes.toArray(),
    ])
    return { spaces, nodes }
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setQuery(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebounced(next), 150)
  }

  const handleClear = () => {
    setQuery('')
    setDebounced('')
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const q = debounced.trim().toLowerCase()
  const matches =
    data === undefined || q === ''
      ? []
      : data.nodes
          .filter((n) => {
            const inName = n.name.toLowerCase().includes(q)
            const inMemo = n.memo?.toLowerCase().includes(q) ?? false
            return inName || inMemo
          })
          .slice(0, 50)

  const nodesById = data
    ? new Map(data.nodes.map((n) => [n.id, n]))
    : new Map()
  const spacesById = data
    ? new Map(data.spaces.map((s) => [s.id, s]))
    : new Map()

  return (
    <div className="flex flex-col">
      <div className="sticky top-12 z-10 border-b border-neutral-200 bg-white p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="이름·메모로 검색"
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-10 pl-9 text-base outline-none focus:border-blue-500"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="지우기"
              className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 active:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {data === undefined && (
        <div className="p-4 text-sm text-neutral-400">불러오는 중…</div>
      )}

      {data && q === '' && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-1 px-6 text-center">
          <p className="text-sm text-neutral-500">검색어를 입력하세요</p>
          <p className="text-xs text-neutral-400">
            이름과 메모를 한꺼번에 검색합니다
          </p>
        </div>
      )}

      {data && q !== '' && matches.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-neutral-400">
          "{debounced}"에 대한 결과가 없습니다
        </div>
      )}

      {data && matches.length > 0 && (
        <ul>
          {matches.map((node) => (
            <SearchResultRow
              key={node.id}
              node={node}
              pathParts={buildAncestorPath(node, nodesById, spacesById)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
