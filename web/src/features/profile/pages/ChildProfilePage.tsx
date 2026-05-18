import { useMemo, useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useCollectionData } from '../../../core/hooks/useCollectionData'
import { useToast } from '../../../core/context/ToastContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { StarChip } from '../../../core/components/StarChip'
import { TransactionList } from '../../../core/components/TransactionList'
import { DangerButton } from '../../../core/components/Button'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import { LoadingView } from '../../../core/components/LoadingView'

export function ChildProfilePage() {
  const { profile, loading, logout } = useAuth()
  const { showToast } = useToast()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const txnQuery = useMemo(
    () => (profile?.id ? firestoreService.childTransactionsQuery(profile.id) : null),
    [profile?.id],
  )
  const { data: transactions } = useCollectionData(txnQuery)

  if (loading) return <LoadingView />
  if (!profile) return null

  const balance = profile.starBalance ?? 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Profile" />

      <Card>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-4xl">
            🧒
          </div>
          <p className="text-title font-extrabold">{profile.displayName}</p>
          <StarChip count={balance} size="lg" />
        </div>
      </Card>

      <section>
        <h2 className="mb-3 text-section font-semibold">Star History</h2>
        <TransactionList transactions={transactions} />
      </section>

      <Card>
        <DangerButton fullWidth onClick={() => setConfirmLogout(true)}>
          Log out
        </DangerButton>
      </Card>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="You will need to ask your parent for your login details."
        confirmLabel="Log out"
        danger
        loading={false}
        onConfirm={() => {
          logout()
          showToast('Logged out.', 'info')
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}
