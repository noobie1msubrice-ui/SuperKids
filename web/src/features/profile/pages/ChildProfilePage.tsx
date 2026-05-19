import { useMemo, useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useCollectionData } from '../../../core/hooks/useCollectionData'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { StarChip } from '../../../core/components/StarChip'
import { TransactionList } from '../../../core/components/TransactionList'
import { DangerButton } from '../../../core/components/Button'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import { LoadingView } from '../../../core/components/LoadingView'
import { KidIcon } from '../../../core/components/icons'
import { ProfileSettings } from '../../settings/ProfileSettings'

export function ChildProfilePage() {
  const { profile, loading, logout } = useAuth()
  const { t } = useTranslation()
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
      <PageHeader title={t('profile.childTitle')} />

      <Card>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary/10 text-4xl">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <KidIcon className="h-12 w-12 text-secondary" />
            )}
          </div>
          <p className="text-title font-extrabold">{profile.displayName}</p>
          <StarChip count={balance} size="lg" />
        </div>
      </Card>

      <ProfileSettings />

      <section>
        <h2 className="mb-3 text-section font-semibold">{t('profile.starHistory')}</h2>
        <TransactionList transactions={transactions} />
      </section>

      <Card>
        <DangerButton fullWidth onClick={() => setConfirmLogout(true)}>
          {t('common.logOut')}
        </DangerButton>
      </Card>

      <ConfirmDialog
        open={confirmLogout}
        title={t('common.logOut')}
        message=""
        confirmLabel={t('common.logOut')}
        cancelLabel={t('common.cancel')}
        danger
        loading={false}
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}
