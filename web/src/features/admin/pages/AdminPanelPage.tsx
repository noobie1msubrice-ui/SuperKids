import { useMemo, useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useToast } from '../../../core/context/ToastContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useAllUsers, useAllTasks, useAllStoreItems } from '../hooks/useAdminData'
import { StarBalanceEditor } from '../components/StarBalanceEditor'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import { StatusBadge } from '../../../core/components/StatusBadge'
import { TASK_STATUS } from '../../../core/utils/statusLabels'
import { useTranslation } from '../../../core/i18n/LanguageContext'

interface PendingAction {
  title: string
  message: string
  run: () => Promise<void>
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface p-4 text-center shadow-card">
      <div className="text-title font-extrabold text-primary">{value}</div>
      <div className="text-caption font-bold uppercase text-textMuted">{label}</div>
    </div>
  )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg bg-danger/10 px-3 py-1 text-caption font-bold text-danger hover:bg-danger/20"
    >
      Delete
    </button>
  )
}

/** Admin panel: full control over every account, task and store item. */
export function AdminPanelPage() {
  const { profile, logout } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { data: users, loading: usersLoading, error } = useAllUsers()
  const { data: tasks, loading: tasksLoading } = useAllTasks()
  const { data: storeItems, loading: storeLoading } = useAllStoreItems()

  const [pending, setPending] = useState<PendingAction | null>(null)
  const [busy, setBusy] = useState(false)

  const nameOf = useMemo(() => {
    const map: Record<string, string> = {}
    users.forEach((u) => {
      map[u.id] = u.displayName
    })
    return map
  }, [users])

  const parents = users.filter((u) => u.role === 'parent')
  const children = users.filter((u) => u.role === 'child')
  const admins = users.filter((u) => u.role === 'admin')
  const parentIds = new Set(parents.map((p) => p.id))
  const orphanChildren = children.filter(
    (c) => !c.parentId || !parentIds.has(c.parentId),
  )

  async function runPending(): Promise<void> {
    if (!pending) return
    setBusy(true)
    try {
      await pending.run()
      showToast('Done.', 'success')
    } catch {
      showToast('That action failed.', 'error')
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  function askDeleteUser(uid: string, name: string): void {
    setPending({
      title: `Delete ${name}?`,
      message: 'This removes the account profile from the app. This cannot be undone.',
      run: () => firestoreService.adminDeleteUser(uid),
    })
  }
  function askDeleteTask(id: string, title: string): void {
    setPending({
      title: 'Delete task?',
      message: `Permanently delete "${title}".`,
      run: () => firestoreService.deleteTask(id),
    })
  }
  function askDeleteStoreItem(id: string, name: string): void {
    setPending({
      title: 'Delete store item?',
      message: `Permanently delete "${name}".`,
      run: () => firestoreService.deleteStoreItem(id),
    })
  }

  async function toggleStoreItem(id: string, isActive: boolean): Promise<void> {
    try {
      await firestoreService.updateStoreItem(id, { isActive: !isActive })
      showToast('Store item updated.', 'success')
    } catch {
      showToast('Could not update item.', 'error')
    }
  }

  const loading = usersLoading || tasksLoading || storeLoading

  return (
    <div className="min-h-screen bg-bgLight">
      <header className="bg-primary text-white shadow-card">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <span className="text-section font-extrabold">Winkz Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-caption opacity-80">{profile?.displayName}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-caption font-bold hover:bg-white/25"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 py-6">
        {loading && <LoadingView />}
        {error && <ErrorView />}

        {!loading && !error && (
          <div className="flex flex-col gap-8">
            {/* Stats */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Parents" value={parents.length} />
              <Stat label="Children" value={children.length} />
              <Stat label="Tasks" value={tasks.length} />
              <Stat label="Store items" value={storeItems.length} />
            </section>

            {/* Families */}
            <section>
              <h2 className="mb-3 text-title font-extrabold text-gray-800">Families</h2>
              {parents.length === 0 ? (
                <p className="rounded-2xl bg-surface p-6 text-center text-textMuted shadow-card">
                  No parent accounts yet.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {parents.map((parent) => {
                    const kids = children.filter((c) => c.parentId === parent.id)
                    return (
                      <div key={parent.id} className="rounded-2xl bg-surface p-4 shadow-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-section font-bold text-gray-800">
                              {parent.displayName}
                            </div>
                            <div className="truncate text-caption text-textMuted">
                              {parent.email}
                            </div>
                          </div>
                          <DeleteButton
                            onClick={() => askDeleteUser(parent.id, parent.displayName)}
                          />
                        </div>

                        {kids.length > 0 && (
                          <ul className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                            {kids.map((kid) => (
                              <li
                                key={kid.id}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-gray-700">
                                    🧒 {kid.displayName}
                                  </div>
                                  <div className="truncate text-caption text-textMuted">
                                    {kid.email}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StarBalanceEditor
                                    uid={kid.id}
                                    current={kid.starBalance ?? 0}
                                  />
                                  <DeleteButton
                                    onClick={() => askDeleteUser(kid.id, kid.displayName)}
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Orphan children + admins */}
            {(orphanChildren.length > 0 || admins.length > 0) && (
              <section>
                <h2 className="mb-3 text-title font-extrabold text-gray-800">
                  Other accounts
                </h2>
                <div className="flex flex-col gap-2">
                  {admins.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-gray-800">🛠️ {a.displayName}</span>
                        <span className="ml-2 text-caption text-textMuted">{a.email}</span>
                      </div>
                      {a.id !== profile?.id && (
                        <DeleteButton onClick={() => askDeleteUser(a.id, a.displayName)} />
                      )}
                    </div>
                  ))}
                  {orphanChildren.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-gray-800">🧒 {c.displayName}</span>
                        <span className="ml-2 text-caption text-textMuted">
                          {c.email} · no parent
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarBalanceEditor uid={c.id} current={c.starBalance ?? 0} />
                        <DeleteButton onClick={() => askDeleteUser(c.id, c.displayName)} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tasks */}
            <section>
              <h2 className="mb-3 text-title font-extrabold text-gray-800">
                All Tasks ({tasks.length})
              </h2>
              {tasks.length === 0 ? (
                <p className="rounded-2xl bg-surface p-6 text-center text-textMuted shadow-card">
                  No tasks yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-bold text-gray-800">
                          {task.title}
                        </div>
                        <div className="text-caption text-textMuted">
                          {nameOf[task.childId] ?? 'Unknown child'} · ⭐ {task.starReward}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge
                          label={t(TASK_STATUS[task.status].labelKey)}
                          tone={TASK_STATUS[task.status].tone}
                        />
                        <DeleteButton onClick={() => askDeleteTask(task.id, task.title)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Store items */}
            <section>
              <h2 className="mb-3 text-title font-extrabold text-gray-800">
                All Store Items ({storeItems.length})
              </h2>
              {storeItems.length === 0 ? (
                <p className="rounded-2xl bg-surface p-6 text-center text-textMuted shadow-card">
                  No store items yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {storeItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-bold text-gray-800">{item.name}</div>
                        <div className="text-caption text-textMuted">
                          {nameOf[item.parentId] ?? 'Unknown parent'} · ⭐ {item.starPrice}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStoreItem(item.id, item.isActive)}
                          className={`rounded-lg px-3 py-1 text-caption font-bold ${
                            item.isActive
                              ? 'bg-success/15 text-success'
                              : 'bg-textMuted/15 text-textMuted'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Hidden'}
                        </button>
                        <DeleteButton
                          onClick={() => askDeleteStoreItem(item.id, item.name)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.title ?? ''}
        message={pending?.message ?? ''}
        confirmLabel="Delete"
        danger
        loading={busy}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
