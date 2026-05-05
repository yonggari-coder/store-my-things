export default function ChildDots() {
  return (
    <div
      aria-hidden
      className="absolute right-1.5 bottom-1.5 grid grid-cols-2 gap-0.5"
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-1 w-1 rounded-full bg-neutral-500/70" />
      ))}
    </div>
  )
}
