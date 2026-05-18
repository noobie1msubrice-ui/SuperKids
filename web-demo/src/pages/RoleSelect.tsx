interface Props { onParent: () => void; onChild: () => void }

export default function RoleSelect({ onParent, onChild }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bgLight p-8">
      <div className="mb-2 text-7xl">⭐</div>
      <h1 className="mb-1 text-4xl font-extrabold text-primary">SuperKids</h1>
      <p className="mb-12 text-lg text-gray-500">Earn stars, spend them on rewards!</p>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <button
          onClick={onParent}
          className="flex items-center gap-4 rounded-2xl bg-primary py-5 px-6 text-xl font-bold text-white shadow-lg transition hover:opacity-90"
        >
          <span className="text-3xl">👨‍👩‍👧</span> I'm a Parent
        </button>
        <button
          onClick={onChild}
          className="flex items-center gap-4 rounded-2xl bg-secondary py-5 px-6 text-xl font-bold text-white shadow-lg transition hover:opacity-90"
        >
          <span className="text-3xl">🧒</span> I'm a Kid
        </button>
      </div>
      <p className="mt-10 text-xs text-gray-400">Demo mode — no account needed</p>
    </div>
  )
}
