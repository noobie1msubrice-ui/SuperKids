import { useState } from 'react'
import { useDemo } from '../context/DemoContext'

type Tab = 'tasks' | 'store' | 'backpack' | 'profile'

const STATUS_COLOR = { owned: 'bg-purple-100 text-purple-700', redeem_requested: 'bg-amber-100 text-amber-700', redeemed: 'bg-green-100 text-green-700' }
const STATUS_LABEL = { owned: '🎒 In backpack', redeem_requested: '🙋 Shown to parent', redeemed: '🎉 Got it!' }

export default function ChildHome() {
  const { state, dispatch, currentUser } = useDemo()
  const [tab, setTab] = useState<Tab>('tasks')
  const [buyConfirm, setBuyConfirm] = useState<string | null>(null)

  if (!currentUser || currentUser.role !== 'child') return null

  const child = state.users.find(u => u.id === currentUser.id)!
  const balance = child.starBalance ?? 0
  const myTasks = state.tasks.filter(t => t.childId === currentUser.id).sort((a, b) => {
    const order = { available: 0, pending_approval: 1, completed: 2 }
    return order[a.status] - order[b.status]
  })
  const storeItems = state.storeItems.filter(i => i.parentId === child.parentId && i.isActive)
  const myBackpack = state.backpackItems.filter(b => b.childId === currentUser.id)
  const myTxns = state.transactions.filter(t => t.childId === currentUser.id)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'store', label: 'Store', icon: '🏪' },
    { id: 'backpack', label: 'Backpack', icon: '🎒' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-bgLight">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-extrabold text-primary">SuperKids</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-star/20 px-3 py-1.5 font-extrabold text-amber-700">
            ⭐ {balance} Stars
          </div>
        </div>
        {/* Nav */}
        <div className="mx-auto max-w-2xl flex border-t border-gray-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-bold transition ${tab === t.id ? 'border-b-2 border-secondary text-secondary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">

        {/* ── TASKS ── */}
        {tab === 'tasks' && (
          <div className="anim-slide-up">
            <h2 className="mb-4 text-xl font-extrabold text-gray-800">My Tasks</h2>
            {myTasks.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mb-2 text-5xl">😎</div>
                <p className="text-gray-500">No tasks right now — nice!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myTasks.map(task => (
                  <div key={task.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-extrabold text-gray-800">{task.title}</div>
                        {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-star/20 px-2 py-0.5 font-bold text-amber-700 whitespace-nowrap">
                        ⭐ {task.starReward}
                      </div>
                    </div>
                    {task.status === 'available' && (
                      <button
                        onClick={() => dispatch({ type: 'MARK_DONE', taskId: task.id })}
                        className="w-full rounded-xl bg-secondary py-3 text-lg font-extrabold text-white shadow hover:opacity-90"
                      >
                        Done! ✋
                      </button>
                    )}
                    {task.status === 'pending_approval' && (
                      <div className="rounded-xl bg-amber-50 py-3 text-center text-sm font-bold text-amber-600">
                        ⏳ Waiting for parent to approve…
                      </div>
                    )}
                    {task.status === 'completed' && (
                      <div className="rounded-xl bg-green-50 py-3 text-center text-sm font-bold text-green-600">
                        ✅ Done! You earned ⭐ {task.starReward}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STORE ── */}
        {tab === 'store' && (
          <div className="anim-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-800">Star Store</h2>
              <div className="flex items-center gap-1 rounded-full bg-star/20 px-3 py-1 font-bold text-amber-700">⭐ {balance}</div>
            </div>
            {storeItems.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mb-2 text-5xl">🏪</div>
                <p className="text-gray-500">The store is empty — check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {storeItems.map(item => {
                  const canAfford = balance >= item.starPrice
                  return (
                    <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm flex flex-col">
                      <div className="mb-2 text-5xl text-center">{item.emoji}</div>
                      <div className="font-extrabold text-gray-800 text-center">{item.name}</div>
                      {item.description && <div className="mb-1 text-xs text-gray-400 text-center">{item.description}</div>}
                      <div className="mb-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-star/20 px-2 py-0.5 text-sm font-bold text-amber-700">⭐ {item.starPrice}</span>
                      </div>
                      <button
                        onClick={() => canAfford ? setBuyConfirm(item.id) : dispatch({ type: 'CLEAR_TOAST' })}
                        className={`mt-auto rounded-xl py-2 text-sm font-extrabold ${canAfford ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        {canAfford ? 'Buy ✨' : `Need ${item.starPrice - balance} more ⭐`}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BACKPACK ── */}
        {tab === 'backpack' && (
          <div className="anim-slide-up">
            <h2 className="mb-4 text-xl font-extrabold text-gray-800">My Backpack</h2>
            {myBackpack.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mb-2 text-5xl">🎒</div>
                <p className="text-gray-500">Your backpack is empty — buy something from the Star Store!</p>
                <button onClick={() => setTab('store')} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Go to Store</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myBackpack.map(item => (
                  <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm flex flex-col">
                    <div className="mb-2 text-5xl text-center">{item.emoji}</div>
                    <div className="font-extrabold text-gray-800 text-center">{item.name}</div>
                    <div className="mb-3 text-center text-xs text-gray-400">⭐ {item.pricePaid} spent</div>
                    <span className={`mb-3 self-center rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLOR[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    {item.status === 'owned' && (
                      <button
                        onClick={() => dispatch({ type: 'REQUEST_REDEEM', backpackId: item.id })}
                        className="mt-auto rounded-xl bg-secondary py-2 text-sm font-extrabold text-white hover:opacity-90"
                      >
                        Show Parent 🙋
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="anim-slide-up">
            <h2 className="mb-4 text-xl font-extrabold text-gray-800">My Profile</h2>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col items-center gap-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-4xl">🧒</div>
                <div className="text-2xl font-extrabold text-gray-800">{child.displayName}</div>
                <div className="flex items-center gap-2 rounded-full bg-star/20 px-4 py-2 text-xl font-extrabold text-amber-700">⭐ {balance} Stars</div>
              </div>

              {myTxns.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 text-xs font-bold uppercase text-gray-400">Star History</div>
                  <div className="flex flex-col gap-1.5">
                    {myTxns.slice(0, 8).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                        <span className="text-gray-600">{tx.reason}</span>
                        <span className={`font-extrabold ${tx.type === 'earn' ? 'text-success' : 'text-danger'}`}>
                          {tx.type === 'earn' ? '+' : '−'}{tx.amount} ⭐
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => dispatch({ type: 'LOGOUT' })} className="w-full rounded-xl border-2 border-danger py-2 font-bold text-danger hover:bg-red-50">
                Log out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── BUY CONFIRM MODAL ── */}
      {buyConfirm && (() => {
        const item = storeItems.find(i => i.id === buyConfirm)!
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setBuyConfirm(null)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl anim-pop-in" onClick={e => e.stopPropagation()}>
              <div className="mb-2 text-6xl">{item.emoji}</div>
              <h3 className="mb-1 text-2xl font-extrabold text-gray-800">{item.name}</h3>
              <p className="mb-4 text-gray-500">Buy for <span className="font-extrabold text-amber-600">⭐ {item.starPrice}</span>?</p>
              <p className="mb-6 text-sm text-gray-400">You have ⭐ {balance} → will have ⭐ {balance - item.starPrice}</p>
              <div className="flex gap-3">
                <button onClick={() => setBuyConfirm(null)} className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-bold text-gray-500">Cancel</button>
                <button
                  onClick={() => { dispatch({ type: 'PURCHASE', itemId: item.id }); setBuyConfirm(null) }}
                  className="flex-1 rounded-xl bg-primary py-3 font-extrabold text-white hover:opacity-90"
                >
                  Buy! ✨
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
