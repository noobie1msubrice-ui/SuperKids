import { useDemo } from '../context/DemoContext'

interface Props { role: 'parent' | 'child'; onBack: () => void }

export default function DemoLogin({ role, onBack }: Props) {
  const { state, dispatch } = useDemo()
  const accounts = state.users.filter(u => u.role === role)
  const isChild = role === 'child'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bgLight p-8">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="mb-6 text-sm text-gray-400 hover:text-gray-700">← Back</button>
        <h2 className="mb-1 text-2xl font-extrabold text-gray-800">
          {isChild ? 'Kid Login' : 'Parent Login'}
        </h2>
        <p className="mb-8 text-gray-500">Demo mode — pick an account to explore:</p>
        <div className="flex flex-col gap-3">
          {accounts.map(u => (
            <button
              key={u.id}
              onClick={() => dispatch({ type: 'LOGIN', userId: u.id })}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow transition hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl font-extrabold text-white ${isChild ? 'bg-secondary' : 'bg-primary'}`}>
                {isChild ? '🧒' : u.displayName[0]}
              </div>
              <div>
                <div className="font-bold text-gray-800">{u.displayName}</div>
                <div className="text-sm text-gray-500">
                  {isChild ? `⭐ ${u.starBalance ?? 0} Stars` : u.email}
                </div>
              </div>
            </button>
          ))}
        </div>
        {isChild && (
          <p className="mt-8 text-center text-xs text-gray-400">
            A parent creates your account — ask them for the details.
          </p>
        )}
      </div>
    </div>
  )
}
