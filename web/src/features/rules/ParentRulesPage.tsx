import { useState } from 'react'
import { useAuth } from '../../core/context/AuthContext'
import { useToast } from '../../core/context/ToastContext'
import { useTranslation } from '../../core/i18n/LanguageContext'
import { useChildren } from '../family/hooks/useChildren'
import { useRuleset } from './useRuleset'
import { functionsService } from '../../core/services/functionsService'
import { PageHeader } from '../../core/components/PageHeader'
import { Card } from '../../core/components/Card'
import { PrimaryButton } from '../../core/components/Button'
import { FormError } from '../../core/components/FormError'
import { LoadingView } from '../../core/components/LoadingView'

/** Parent's Rules tab — write rules, send to kids, see acceptance progress. */
export function ParentRulesPage() {
  const { profile } = useAuth()
  const { children } = useChildren()
  const { showToast } = useToast()
  const { t } = useTranslation()
  const { ruleset, loading } = useRuleset(profile?.id ?? null)

  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return <LoadingView />

  const now = Date.now()
  const isLocked =
    ruleset?.status === 'active' &&
    (ruleset.expiresAt?.toMillis() ?? 0) > now
  const expiresInDays =
    ruleset?.expiresAt
      ? Math.max(0, Math.ceil((ruleset.expiresAt.toMillis() - now) / 86_400_000))
      : 0

  async function send(): Promise<void> {
    const text = draft.trim()
    if (!text) {
      setError(t('rules.empty'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await functionsService.sendRules({ text })
      showToast(t('rules.sent'), 'success')
      setDraft('')
    } catch (err) {
      setError((err as Error).message || t('common.errorGeneric'))
    } finally {
      setBusy(false)
    }
  }

  const acceptedSet = new Set(ruleset?.acceptedBy ?? [])
  const deniedKid = ruleset?.deniedBy
    ? children.find((c) => c.id === ruleset.deniedBy)
    : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('rules.parentTitle')} />

      {ruleset?.status === 'denied' && (
        <Card className="border-2 border-danger/30 bg-danger/5">
          <p className="text-section font-bold text-danger">
            {t('rules.deniedTitle')}
          </p>
          <p className="mt-1 text-body text-textMuted">
            {t('rules.deniedBody', { name: deniedKid?.displayName ?? t('rules.aKid') })}
          </p>
        </Card>
      )}

      {ruleset?.status === 'pending' && (
        <Card>
          <p className="text-section font-bold">{t('rules.pendingTitle')}</p>
          <p className="mt-1 mb-3 whitespace-pre-wrap text-body">{ruleset.text}</p>
          <p className="text-caption font-bold text-textMuted">
            {t('rules.waitingHeader')}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {children.map((kid) => (
              <li key={kid.id} className="flex items-center gap-2 text-body">
                <span aria-hidden>{acceptedSet.has(kid.id) ? '✅' : '⏳'}</span>
                <span>{kid.displayName}</span>
                <span className="text-caption text-textMuted">
                  {acceptedSet.has(kid.id) ? t('rules.accepted') : t('rules.pendingKid')}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {isLocked && (
        <Card className="border-2 border-success/30 bg-success/5">
          <p className="text-section font-bold text-success">
            🔒 {t('rules.lockedTitle')}
          </p>
          <p className="mt-1 text-caption text-textMuted">
            {t('rules.lockedBody', { days: expiresInDays })}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-body">{ruleset?.text}</p>
        </Card>
      )}

      {!isLocked && (
        <Card>
          <h2 className="mb-3 text-section font-bold">
            {ruleset?.status === 'denied' || !ruleset
              ? t('rules.writeNew')
              : t('rules.replaceTitle')}
          </h2>
          <FormError message={error} />
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('rules.placeholder')}
            rows={6}
            disabled={busy}
            className="mt-1 w-full rounded-xl border-2 border-textMuted/30 px-3 py-2 text-body focus:border-primary focus:outline-none"
          />
          <PrimaryButton
            onClick={send}
            loading={busy}
            disabled={!draft.trim() || children.length === 0}
            className="mt-3 min-h-[44px] self-start px-5"
          >
            {t('rules.send')}
          </PrimaryButton>
          {children.length === 0 && (
            <p className="mt-2 text-caption text-textMuted">
              {t('rules.needsKids')}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
