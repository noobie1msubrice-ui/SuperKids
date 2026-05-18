import { useState } from 'react'
import { useDemo } from '../context/DemoContext'
import type { Task } from '../types'

type Tab = 'tasks' | 'store' | 'family' | 'profile'

const STATUS_COLOR: Record<Task['status'], string> = {
  available: 'bg-blue-100 text-blue-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
}
const STATUS_LABEL: Record<Task['status'], string> = {
  available: 'Available',
  pending_approval: '⏳ Pending approval',
  completed: '✅ Completed',
}

const EMOJI_OPTIONS = ['🎮', '🍕', '🏆', '🎨', '📚', '🚀', '⚽', '🎁', '🍰', '🌈', '🎵', '🏅']

export default function ParentHome() {
  const { state, dispatch, currentUser } = useDemo()
  const [tab, setTab] = useState<Tab>('tasks')

  // Add Task modal state
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskStars, setTaskStars] = useState(5)
  const [taskChild, setTaskChild] = useState('')

  // Add Item modal state
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemStars, setItemStars] = useState(15)
  const [itemEmoji, setItemEmoji] = useState('🎁')

  // Add Child modal state
  const [showAddChild, setShowAddChild] = useState(false)
  const [childName, setChildName] = useState('')
  const [childEmail, setChildEmail] = useState('')

  if (!currentUser) return null

  const children = state.users.filter(u => u.role === 'child' && u.parentId === currentUser.id)

  function submitTask() {
    if (!taskTitle.trim() || !taskChild) return
    dispatch({ type: 'ADD_TASK', payload: { parentId: currentUser!.id, childId: taskChild, title: taskTitle.trim(), description: taskDesc.trim() || undefined, starReward: taskStars } })
    setShowAddTask(false); setTaskTitle(''); setTaskDesc(''); setTaskStars(5); setTaskChild('')
  }

  function submitItem() {
    if (!itemName.trim()) return
    dispatch({ type: 'ADD_STORE_ITEM', payload: { parentId: currentUser!.id, name: itemName.trim(), description: itemDesc.trim() || undefined, starPrice: itemStars, emoji: itemEmoji, isActive: true } })
    setShowAddItem(false); setItemName(''); setItemDesc(''); setItemStars(15); setItemEmoji('🎁')
  }

  function submitChild() {
    if (!childName.trim()) return
    dispatch({ type: 'ADD_CHILD', displayName: childName.trim(), email: childEmail.trim() || `${childName.toLowerCase()}@demo.com`, parentId: currentUser!.id })
    setShowAddChild(false); setChildName(''); setChildEmail('')
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'store', label: 'Store', icon: '🏪' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
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
          <span className="text-sm font-semibold text-gray-500">Parent — {currentUser.displayName}</span>
        </div>
        {/* Nav tabs */}
        <div className="mx-auto max-w-2xl flex border-t border-gray-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-bold transition ${tab === t.id ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl p-4">

        {/* ── TASKS TAB ── */}
        {tab === 'tasks' && (
          <div className="anim-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-800">Tasks</h2>
              {children.length > 0 && (
                <button onClick={() => setShowAddTask(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90">
                  + Add Task
                </button>
              )}
            </div>
            {children.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mb-2 text-5xl">👶</div>
                <p className="text-gray-500">Add a child first, then you can assign tasks.</p>
                <button onClick={() => setTab('family')} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Go to Family</button>
              </div>
            )}
            {children.length > 0 && (() => {
              const allTasks = state.tasks.filter(t => t.parentId === currentUser.id)
              if (allTasks.length === 0) return (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                  <div className="mb-2 text-5xl">📋</div>
                  <p className="text-gray-500">No tasks yet — click Add Task to assign one.</p>
                </div>
              )
              return (
                <div className="flex flex-col gap-6">
                  {children.map(child => {
                    const childTasks = allTasks
                      .filter(t => t.childId === child.id)
                      .sort((a, b) => (a.status === 'pending_approval' ? -1 : b.status === 'pending_approval' ? 1 : 0))
                    if (childTasks.length === 0) return null
                    return (
                      <section key={child.id}>
                        <h3 className="mb-2 font-bold text-gray-600">{child.displayName}</h3>
                        <div className="flex flex-col gap-2">
                          {childTasks.map(task => (
                            <div key={task.id} className="rounded-2xl bg-white p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-bold text-gray-800">{task.title}</div>
                                  {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-star/20 px-2 py-0.5 text-sm font-bold text-amber-700">⭐ {task.starReward}</span>
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLOR[task.status]}`}>{STATUS_LABEL[task.status]}</span>
                                </div>
                              </div>
                              {task.status === 'pending_approval' && (
                                <div className="mt-3 flex gap-2">
                                  <button onClick={() => dispatch({ type: 'REJECT_TASK', taskId: task.id })} className="flex-1 rounded-xl border-2 border-danger py-1.5 text-sm font-bold text-danger hover:bg-red-50">
                                    Reject
                                  </button>
                                  <button onClick={() => dispatch({ type: 'APPROVE_TASK', taskId: task.id })} className="flex-1 rounded-xl bg-success py-1.5 text-sm font-bold text-white hover:opacity-90">
                                    ✓ Approve
                                  </button>
                                </div>
                              )}
                              {task.status !== 'completed' && (
                                <button onClick={() => dispatch({ type: 'DELETE_TASK', taskId: task.id })} className="mt-2 text-xs text-gray-300 hover:text-danger">Remove</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* ── STORE TAB ── */}
        {tab === 'store' && (
          <div className="anim-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-800">Store</h2>
              <button onClick={() => setShowAddItem(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90">+ Add Item</button>
            </div>
            {state.storeItems.filter(i => i.parentId === currentUser.id).length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mb-2 text-5xl">🏪</div>
                <p className="text-gray-500">Your store is empty — add a reward for your kids.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {state.storeItems.filter(i => i.parentId === currentUser.id).map(item => (
                  <div key={item.id} className={`rounded-2xl bg-white p-4 shadow-sm ${!item.isActive ? 'opacity-50' : ''}`}>
                    <div className="mb-2 text-4xl">{item.emoji}</div>
                    <div className="font-bold text-gray-800">{item.name}</div>
                    {item.description && <div className="text-xs text-gray-400">{item.description}</div>}
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-star/20 px-2 py-0.5 text-sm font-bold text-amber-700">⭐ {item.starPrice}</div>
                    <div className="mt-2 flex gap-1">
                      <button onClick={() => dispatch({ type: 'TOGGLE_ITEM', itemId: item.id })} className={`flex-1 rounded-lg py-1 text-xs font-bold ${item.isActive ? 'bg-gray-100 text-gray-500' : 'bg-success/20 text-success'}`}>
                        {item.isActive ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => dispatch({ type: 'DELETE_ITEM', itemId: item.id })} className="rounded-lg px-2 py-1 text-xs text-gray-300 hover:text-danger">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FAMILY TAB ── */}
        {tab === 'family' && (
          <div className="anim-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-800">Family</h2>
              <button onClick={() => setShowAddChild(true)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow hover:opacity-90">+ Add Child</button>
            </div>
            {children.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mb-2 text-5xl">👶</div>
                <p className="text-gray-500">Add your first child to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {children.map(child => {
                  const childBackpack = state.backpackItems.filter(b => b.childId === child.id)
                  const pending = childBackpack.filter(b => b.status === 'redeem_requested')
                  const childTxns = state.transactions.filter(t => t.childId === child.id).slice(0, 5)
                  return (
                    <div key={child.id} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-2xl">🧒</div>
                          <div>
                            <div className="font-extrabold text-gray-800">{child.displayName}</div>
                            <div className="text-sm text-gray-500">{child.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-star/20 px-3 py-1 font-bold text-amber-700">⭐ {child.starBalance ?? 0}</div>
                      </div>
                      {pending.length > 0 && (
                        <div className="mb-3">
                          <div className="mb-1 text-xs font-bold uppercase text-gray-400">Wants to redeem</div>
                          <div className="flex flex-col gap-2">
                            {pending.map(b => (
                              <div key={b.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2">
                                <span>{b.emoji} {b.name} <span className="text-xs text-gray-400">(⭐ {b.pricePaid})</span></span>
                                <button onClick={() => dispatch({ type: 'MARK_REDEEMED', backpackId: b.id })} className="rounded-lg bg-success px-3 py-1 text-xs font-bold text-white">
                                  Mark given ✓
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {childTxns.length > 0 && (
                        <div>
                          <div className="mb-1 text-xs font-bold uppercase text-gray-400">Recent Stars</div>
                          <div className="flex flex-col gap-1">
                            {childTxns.map(tx => (
                              <div key={tx.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{tx.reason}</span>
                                <span className={`font-bold ${tx.type === 'earn' ? 'text-success' : 'text-danger'}`}>
                                  {tx.type === 'earn' ? '+' : '-'}{tx.amount} ⭐
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="anim-slide-up">
            <h2 className="mb-4 text-xl font-extrabold text-gray-800">Profile</h2>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-extrabold text-white">{currentUser.displayName[0]}</div>
                <div>
                  <div className="text-xl font-extrabold text-gray-800">{currentUser.displayName}</div>
                  <div className="text-gray-500">{currentUser.email}</div>
                  <div className="mt-0.5 text-xs text-gray-400">Parent account</div>
                </div>
              </div>
              <button onClick={() => dispatch({ type: 'LOGOUT' })} className="w-full rounded-xl border-2 border-danger py-2 font-bold text-danger hover:bg-red-50">
                Log out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── ADD TASK MODAL ── */}
      {showAddTask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddTask(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl anim-pop-in" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Add Task</h3>
              <button onClick={() => setShowAddTask(false)} className="text-2xl text-gray-300 hover:text-gray-600">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Task title *</label>
                <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Make your bed" className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Description (optional)</label>
                <input value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="e.g. Pillows tidy too!" className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Star reward ⭐</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setTaskStars(Math.max(1, taskStars - 1))} className="h-10 w-10 rounded-xl bg-gray-100 text-lg font-bold">−</button>
                  <span className="w-10 text-center text-xl font-extrabold text-primary">{taskStars}</span>
                  <button onClick={() => setTaskStars(taskStars + 1)} className="h-10 w-10 rounded-xl bg-gray-100 text-lg font-bold">+</button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Assign to *</label>
                <select value={taskChild} onChange={e => setTaskChild(e.target.value)} className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 outline-none focus:border-primary">
                  <option value="">Select a child…</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                </select>
              </div>
              <button onClick={submitTask} disabled={!taskTitle.trim() || !taskChild} className="mt-2 w-full rounded-xl bg-primary py-3 font-bold text-white disabled:opacity-40">
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD STORE ITEM MODAL ── */}
      {showAddItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddItem(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl anim-pop-in" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Add Store Item</h3>
              <button onClick={() => setShowAddItem(false)} className="text-2xl text-gray-300 hover:text-gray-600">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Item name *</label>
                <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Extra Screen Time" className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Description (optional)</label>
                <input value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder="e.g. 30 extra minutes tonight" className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Star price ⭐</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setItemStars(Math.max(1, itemStars - 1))} className="h-10 w-10 rounded-xl bg-gray-100 text-lg font-bold">−</button>
                  <span className="w-10 text-center text-xl font-extrabold text-primary">{itemStars}</span>
                  <button onClick={() => setItemStars(itemStars + 1)} className="h-10 w-10 rounded-xl bg-gray-100 text-lg font-bold">+</button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">Pick an emoji</label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setItemEmoji(e)} className={`rounded-xl py-1.5 text-2xl ${itemEmoji === e ? 'bg-primary/10 ring-2 ring-primary' : 'bg-gray-50 hover:bg-gray-100'}`}>{e}</button>
                  ))}
                </div>
              </div>
              <button onClick={submitItem} disabled={!itemName.trim()} className="mt-2 w-full rounded-xl bg-primary py-3 font-bold text-white disabled:opacity-40">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD CHILD MODAL ── */}
      {showAddChild && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddChild(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl anim-pop-in" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Add Child</h3>
              <button onClick={() => setShowAddChild(false)} className="text-2xl text-gray-300 hover:text-gray-600">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Child's name *</label>
                <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="e.g. Jamie" className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-600">Email (for login)</label>
                <input value={childEmail} onChange={e => setChildEmail(e.target.value)} placeholder="e.g. jamie@example.com" className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 outline-none focus:border-primary" />
              </div>
              <button onClick={submitChild} disabled={!childName.trim()} className="mt-2 w-full rounded-xl bg-primary py-3 font-bold text-white disabled:opacity-40">
                Add Child
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
