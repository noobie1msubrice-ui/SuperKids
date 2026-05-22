import { useState } from 'react'
import { useAuth } from '../../core/context/AuthContext'
import { useToast } from '../../core/context/ToastContext'
import { useTranslation } from '../../core/i18n/LanguageContext'
import { useRuleset } from './useRuleset'
import { functionsService } from '../../core/services/functionsService'
import { PageHeader } from '../../core/components/PageHeader'
import { Card } from '../../core/components/Card'
import { PrimaryButton, DangerButton } from '../../core/components/Button'
import { LoadingView } from '../../core/components/LoadingView'
import { EmptyState } from '../../core/components/EmptyState'

/** Kid's Rules tab — see the rules and Accept / Deny when waiting on you. */
export function ChildRulesPage() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { ruleset, loading } = useRuleset(profile?.parentId ?? null)
  const [busy, setBusy] = useState(false)

  if (loading) return <LoadingView />

  if (!ruleset) {
    return (
      <div>
        <PageHeader title={t('rules.kidTitle')} />
        <EmptyState icon="📜" message={t('rules.noneYet')} />
      </div>
    )
  }

  const alreadyAccepted = (ruleset.acceptedBy ?? []).includes(profile?.id ?? '')

  async function respond(accept: boolean): Promise<void> {
    setBusy(true)
    try {
      const result = await functionsService.respondToRule({ accept })
      if (!accept) {
        showToast(t('rules.youDenied'), 'info')
      } else if (result.status === 'active') {
        showToast(t('rules.allAccepted'), 'success')
      } else {
        showToast(t('rules.youAccepted'), 'success')
      }
    } catch (err) {
      showToast((err as Error).message || t('common.errorGeneric'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('rules.kidTitle')} />

      <Card>
        <p className="mb-2 text-caption font-bold uppercase text-textMuted">
          {ruleset.status === 'active'
            ? `🔒 ${t('rules.lockedShort')}`
            : ruleset.status === 'denied'
              ? t('rules.deniedShort')
              : t('rules.pendingShort')}
        </p>
        <p className="whitespace-pre-wrap text-body">{ruleset.text}</p>

        {ruleset.status === 'pending' && !alreadyAccepted && (
          <div className="mt-5 flex gap-3">
            <DangerButton
              fullWidth
              loading={busy}
              onClick={() => respond(false)}
              className="min-h-[48px]"
            >
              {t('rules.deny')}
            </DangerButton>
            <PrimaryButton
              fullWidth
              loading={busy}
              onClick={() => respond(true)}
              className="min-h-[48px]"
            >
              {t('rules.accept')}
            </PrimaryButton>
          </div>
        )}

        {ruleset.status === 'pending' && alreadyAccepted && (
          <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-center text-body font-semibold text-success">
            ✓ {t('rules.youAcceptedWaiting')}
          </p>
        )}
      </Card>
    </div>
  )
}
