import { Link, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="flex min-h-full flex-col bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur">
        <Link to="/" className="text-sm font-semibold">
          Where Is My Phone
        </Link>
        <nav className="flex gap-4 text-sm text-neutral-500">
          <Link to="/search" className="hover:text-neutral-900">
            검색
          </Link>
          <Link to="/settings" className="hover:text-neutral-900">
            설정
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
