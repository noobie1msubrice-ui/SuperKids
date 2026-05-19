import { useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useTranslation } from '../../../core/i18n/LanguageContext'
import { PageHeader } from '../../../core/components/PageHeader'
import { Card } from '../../../core/components/Card'
import { DangerButton } from '../../../core/components/Button'
import { ConfirmDialog } from '../../../core/components/ConfirmDialog'
import { ParentIcon } from '../../../core/components/icons'
import { ProfileSettings } from '../../settings/ProfileSettings'

export function ParentProfilePage() {
  const { profile, logout } = useAuth()
  const { t } = useTranslation()
  const [confirmLogout, setConfirmLogout] = useState(false)

  if (!profile) return null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('profile.parentTitle')} />

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <ParentIcon className="h-10 w-10 text-primary" />
            )}
          </div>
          <div>
            <p className="text-section font-bold">{profile.displayName}</p>
            <p className="text-caption text-textMuted">{t('profile.parent')}</p>
          </div>
        </div>
      </Card>

      <ProfileSettings />

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
