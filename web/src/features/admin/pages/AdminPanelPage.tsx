import { useMemo, useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useToast } from '../../../core/context/ToastContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useAllUsers, useAllTasks, useAllStoreItems } from '../hooks/useAdminData'
import { StarBalanceEditor } from '../components/StarBalanceEditor'
import { EditUserModal } from '../components/EditUserModal'
import { StarHistoryModal } from '../components/StarHistoryModal'
import { LoadingView } from '../../../core/components/LoadingView'
import { ErrorView } from '../../../core/components/ErrorView'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import { StatusBadge } from '../../../core/components/StatusBadge'
import { UserAvatar } from '../../../core/components/UserAvatar'
import { PrimaryButton } from '../../../core/components/Button'
import { TASK_STATUS } from '../../../core/utils/statusLabels'
import { AdminIcon } from '../../../core/components/icons'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { useAdminBroadcast } from '../../../core/hooks/useAdminBroadcast'
import type { UserProfile } from '../../../models/userProfile'
import type { TaskStatus } from '../../../models/task'

/** A user is considered online if they heartbeated in the last 75 seconds. */
const ONLINE_THRESHOLD_MS = 75_000
function isOnline(user: UserProfile): boolean {
  if (!user.lastActiveAt) return false
  return Date.now() - user.lastActiveAt.toMillis() < ONLINE_THRESHOLD_MS
}

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

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border-2 border-textMuted/30 px-4 py-2 text-body focus:border-primary focus:outline-none"
    />
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

function ActionButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg bg-primary/10 px-3 py-1 text-caption font-bold text-primary hover:bg-primary/20"
    >
      {label}
    </button>
  )
}

/** The Edit / Star history / Delete button cluster shared by every user row. */
function UserActions({
  user,
  isSelf,
  onEdit,
  onHistory,
  onDelete,
}: {
  user: UserProfile
  isSelf: boolean
  onEdit: () => void
  onHistory: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ActionButton onClick={onEdit} label="Edit" />
      {user.role === 'child' && (
        <ActionButton onClick={onHistory} label="⭐ History" />
      )}
      {!isSelf && <DeleteButton onClick={onDelete} />}
    </div>
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
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [historyChild, setHistoryChild] = useState<UserProfile | null>(null)

  const [userSearch, setUserSearch] = useState('')
  const [taskSearch, setTaskSearch] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus | 'all'>('all')
  const [storeSearch, setStoreSearch] = useState('')

  // Broadcast composer: writes meta/adminMessage; every signed-in user sees it
  // as a top banner until they dismiss.
  const activeBroadcast = useAdminBroadcast()
  const [bcastText, setBcastText] = useState('')
  const [bcastBusy, setBcastBusy] = useState(false)

  async function sendBroadcast(): Promise<void> {
    const text = bcastText.trim()
    if (!text || !profile) return
    setBcastBusy(true)
    try {
      await firestoreService.setAdminBroadcast(text, profile.id)
      showToast('Broadcast sent.', 'success')
      setBcastText('')
    } catch {
      showToast('Could not send the broadcast.', 'error')
    } finally {
      setBcastBusy(false)
    }
  }

  async function clearBroadcast(): Promise<void> {
    setBcastBusy(true)
    try {
      await firestoreService.clearAdminBroadcast()
      showToast('Broadcast cleared.', 'success')
    } catch {
      showToast('Could not clear the broadcast.', 'error')
    } finally {
      setBcastBusy(false)
    }
  }

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

  // --- Search / filter ---
  const userTerm = userSearch.trim().toLowerCase()
  const matchUser = (u: UserProfile): boolean =>
    userTerm === '' ||
    `${u.displayName} ${u.email}`.toLowerCase().includes(userTerm)

  const visibleParents = parents.filter(
    (p) => matchUser(p) || children.some((c) => c.parentId === p.id && matchUser(c)),
  )
  const visibleOrphans = orphanChildren.filter(matchUser)
  const visibleAdmins = admins.filter(matchUser)

  const taskTerm = taskSearch.trim().toLowerCase()
  const visibleTasks = tasks.filter(
    (task) =>
      (taskStatus === 'all' || task.status === taskStatus) &&
      (taskTerm === '' || task.title.toLowerCase().includes(taskTerm)),
  )

  const storeTerm = storeSearch.trim().toLowerCase()
  const visibleStoreItems = storeItems.filter(
    (item) => storeTerm === '' || item.name.toLowerCase().includes(storeTerm),
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
            <AdminIcon className="h-6 w-6" />
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

            {/* Broadcast composer */}
            <section>
              <h2 className="mb-3 text-title font-extrabold text-gray-800">
                Broadcast message
              </h2>
              <div className="rounded-2xl bg-surface p-4 shadow-card">
                <textarea
                  value={bcastText}
                  onChange={(e) => setBcastText(e.target.value)}
                  placeholder="Type a message to send to every signed-in user…"
                  rows={3}
                  className="w-full rounded-xl border-2 border-textMuted/30 px-4 py-2 text-body focus:border-primary focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {activeBroadcast && (
                    <span className="mr-auto truncate text-caption text-textMuted">
                      Active: "
                      {activeBroadcast.text.length > 60
                        ? `${activeBroadcast.text.slice(0, 60)}…`
                        : activeBroadcast.text}
                      "
                    </span>
                  )}
                  {activeBroadcast && (
                    <button
                      type="button"
                      onClick={clearBroadcast}
                      disabled={bcastBusy}
                      className="rounded-lg bg-textMuted/10 px-3 py-1.5 text-caption font-bold text-textMuted hover:bg-textMuted/20 disabled:opacity-50"
                    >
                      Clear
                    </button>
                  )}
                  <PrimaryButton
                    onClick={sendBroadcast}
                    loading={bcastBusy}
                    disabled={!bcastText.trim()}
                    className="min-h-[44px] px-4"
                  >
                    Send to all
                  </PrimaryButton>
                </div>
              </div>
            </section>

            {/* Users */}
            <section>
              <h2 className="mb-3 text-title font-extrabold text-gray-800">Users</h2>
              <div className="mb-4">
                <SearchInput
                  value={userSearch}
                  onChange={setUserSearch}
                  placeholder="Search users by name or email…"
                />
              </div>

              {parents.length === 0 ? (
                <p className="rounded-2xl bg-surface p-6 text-center text-textMuted shadow-card">
                  No parent accounts yet.
                </p>
              ) : visibleParents.length === 0 &&
                visibleOrphans.length === 0 &&
                visibleAdmins.length === 0 ? (
                <p className="rounded-2xl bg-surface p-6 text-center text-textMuted shadow-card">
                  No users match your search.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {visibleParents.map((parent) => {
                    const kids = children.filter((c) => c.parentId === parent.id)
                    return (
                      <div key={parent.id} className="rounded-2xl bg-surface p-4 shadow-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar profile={parent} online={isOnline(parent)} />
                            <div className="min-w-0">
                              <div className="text-section font-bold text-gray-800">
                                {parent.displayName}
                              </div>
                              <div className="truncate text-caption text-textMuted">
                                {parent.email}
                              </div>
                            </div>
                          </div>
                          <UserActions
                            user={parent}
                            isSelf={parent.id === profile?.id}
                            onEdit={() => setEditUser(parent)}
                            onHistory={() => {}}
                            onDelete={() => askDeleteUser(parent.id, parent.displayName)}
                          />
                        </div>

                        {kids.length > 0 && (
                          <ul className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                            {kids.map((kid) => (
                              <li
                                key={kid.id}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <UserAvatar profile={kid} online={isOnline(kid)} />
                                  <div className="min-w-0">
                                    <div className="font-bold text-gray-700">
                                      {kid.displayName}
                                    </div>
                                    <div className="truncate text-caption text-textMuted">
                                      {kid.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <StarBalanceEditor
                                    uid={kid.id}
                                    current={kid.starBalance ?? 0}
                                  />
                                  <UserActions
                                    user={kid}
                                    isSelf={false}
                                    onEdit={() => setEditUser(kid)}
                                    onHistory={() => setHistoryChild(kid)}
                                    onDelete={() => askDeleteUser(kid.id, kid.displayName)}
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}

                  {(visibleAdmins.length > 0 || visibleOrphans.length > 0) && (
                    <div className="flex flex-col gap-2">
                      {visibleAdmins.map((a) => (
                        <div
                          key={a.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar profile={a} online={isOnline(a)} />
                            <div className="min-w-0">
                              <div className="font-bold text-gray-800">
                                {a.displayName}
                              </div>
                              <div className="truncate text-caption text-textMuted">
                                {a.email}
                              </div>
                            </div>
                          </div>
                          <UserActions
                            user={a}
                            isSelf={a.id === profile?.id}
                            onEdit={() => setEditUser(a)}
                            onHistory={() => {}}
                            onDelete={() => askDeleteUser(a.id, a.displayName)}
                          />
                        </div>
                      ))}
                      {visibleOrphans.map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <UserAvatar profile={c} online={isOnline(c)} />
                            <div className="min-w-0">
                              <div className="font-bold text-gray-800">
                                {c.displayName}
                              </div>
                              <div className="truncate text-caption text-textMuted">
                                {c.email} · no parent
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StarBalanceEditor uid={c.id} current={c.starBalance ?? 0} />
                            <UserActions
                              user={c}
                              isSelf={false}
                              onEdit={() => setEditUser(c)}
                              onHistory={() => setHistoryChild(c)}
                              onDelete={() => askDeleteUser(c.id, c.displayName)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Tasks */}
            <section>
              <h2 className="mb-3 text-title font-extrabold text-gray-800">
                Tasks ({visibleTasks.length}/{tasks.length})
              </h2>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <SearchInput
                  value={taskSearch}
                  onChange={setTaskSearch}
                  placeholder="Search tasks by title…"
                />
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus | 'all')}
                  className="rounded-xl border-2 border-textMuted/30 px-3 py-2 text-body focus:border-primary focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="available">To do</option>
                  <option value="pending_approval">Pending approval</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {visibleTasks.length === 0 ? (
                <p className="rounded-2xl bg-surface p-6 text-center text-textMuted shadow-card">
                  {tasks.length === 0 ? 'No tasks yet.' : 'No tasks match.'}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {visibleTasks.map((task) => (
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
                Store Items ({visibleStoreItems.length}/{storeItems.length})
              </h2>
              <div className="mb-4">
                <SearchInput
                  value={storeSearch}
                  onChange={setStoreSearch}
                  placeholder="Search store items by name…"
                />
              </div>
              {visibleStoreItems.length === 0 ? (
                <p className="rounded-2xl bg-surface p-6 text-center text-textMuted shadow-card">
                  {storeItems.length === 0 ? 'No store items yet.' : 'No items match.'}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {visibleStoreItems.map((item) => (
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

      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
      )}
      {historyChild && (
        <StarHistoryModal
          child={historyChild}
          onClose={() => setHistoryChild(null)}
        />
      )}
    </div>
  )
}
