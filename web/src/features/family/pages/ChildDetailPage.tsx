import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChildren } from '../hooks/useChildren';
import { ChildManageModal } from '../components/ChildManageModal';
import { firestoreService } from '../../../core/services/firestoreService';
import { functionsService } from '../../../core/services/functionsService';
import { useCollectionData } from '../../../core/hooks/useCollectionData';
import { useAction } from '../../../core/hooks/useAction';
import { useToast } from '../../../core/context/ToastContext';
import { useTranslation } from '../../../core/i18n/LanguageContext';
import { PageHeader } from '../../../core/components/PageHeader';
import { Card } from '../../../core/components/Card';
import { StarChip } from '../../../core/components/StarChip';
import { StatusBadge } from '../../../core/components/StatusBadge';
import { TransactionList } from '../../../core/components/TransactionList';
import { SecondaryButton, DangerButton } from '../../../core/components/Button';
import { PrimaryButton } from '../../../core/components/Button';
import { LoadingView } from '../../../core/components/LoadingView';
import { EmptyState } from '../../../core/components/EmptyState';
import { ConfirmDialog } from '../../../core/components/ConfirmDialog';
import { TASK_STATUS, BACKPACK_STATUS } from '../../../core/utils/statusLabels';

/** Parent's per-child detail page: tasks, backpack, ledger, management (doc 06 §5.7). */
export function ChildDetailPage() {
  const { childId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { children, loading: childrenLoading } = useChildren();
  const child = children.find((c) => c.id === childId);

  const [manageOpen, setManageOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const tasksQuery = useMemo(
    () => (childId ? firestoreService.childTasksQuery(childId) : null),
    [childId],
  );
  const backpackQuery = useMemo(
    () => (childId ? firestoreService.childBackpackQuery(childId) : null),
    [childId],
  );
  const txnQuery = useMemo(
    () => (childId ? firestoreService.childTransactionsQuery(childId) : null),
    [childId],
  );

  const { data: tasks } = useCollectionData(tasksQuery);
  const { data: backpack } = useCollectionData(backpackQuery);
  const { data: transactions } = useCollectionData(txnQuery);

  const redeem = useAction(firestoreService.markRedeemed);
  const remove = useAction(functionsService.deleteChildAccount);

  if (childrenLoading) {
    return <LoadingView />;
  }
  if (!child) {
    return (
      <EmptyState
        icon="🔍"
        message={t('family.childNotFound')}
        action={
          <PrimaryButton onClick={() => navigate('/parent/family')}>
            {t('family.backToFamily')}
          </PrimaryButton>
        }
      />
    );
  }

  async function handleRemove(): Promise<void> {
    const result = await remove.run({ childUid: childId });
    if (result) {
      showToast(t('family.childRemoved'), 'success');
      navigate('/parent/family');
    }
  }

  async function handleRedeem(itemId: string): Promise<void> {
    const result = await redeem.run(itemId);
    if (result !== undefined) {
      showToast(t('family.markedRedeemed'), 'success');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={child.displayName} />

      <Card>
        <div className="flex items-center justify-between gap-4">
          <span className="text-section">{t('family.starBalance')}</span>
          <StarChip count={child.starBalance ?? 0} size="lg" />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <SecondaryButton
            className="min-h-[44px] px-4"
            onClick={() => setManageOpen(true)}
          >
            {t('family.editNamePassword')}
          </SecondaryButton>
          <DangerButton
            className="min-h-[44px] px-4"
            onClick={() => setConfirmRemove(true)}
          >
            {t('family.removeChild')}
          </DangerButton>
        </div>
      </Card>

      <section>
        <h2 className="mb-3 text-section">{t('family.recentTasks')}</h2>
        {tasks.length === 0 ? (
          <EmptyState icon="📋" message={t('family.noTasksChild')} />
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.slice(0, 8).map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
              >
                <span className="min-w-0 truncate text-body font-semibold">
                  {task.title}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <StarChip count={task.starReward} size="sm" />
                  <StatusBadge
                    label={t(TASK_STATUS[task.status].labelKey)}
                    tone={TASK_STATUS[task.status].tone}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-section">{t('family.backpack')}</h2>
        {backpack.length === 0 ? (
          <EmptyState icon="🎒" message={t('family.nothingBought')} />
        ) : (
          <ul className="flex flex-col gap-2">
            {backpack.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
              >
                <span className="min-w-0 truncate text-body font-semibold">
                  {item.name}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge
                    label={t(BACKPACK_STATUS[item.status].labelKey)}
                    tone={BACKPACK_STATUS[item.status].tone}
                  />
                  {item.status === 'redeem_requested' && (
                    <PrimaryButton
                      className="min-h-[40px] px-3 text-caption"
                      loading={redeem.pending}
                      onClick={() => handleRedeem(item.id)}
                    >
                      {t('family.markRedeemed')}
                    </PrimaryButton>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-section">{t('family.starHistory')}</h2>
        <TransactionList transactions={transactions} />
      </section>

      <ChildManageModal
        open={manageOpen}
        child={child}
        onClose={() => setManageOpen(false)}
        onSaved={() => {
          setManageOpen(false);
          showToast(t('family.saved'), 'success');
        }}
      />

      <ConfirmDialog
        open={confirmRemove}
        title={t('family.removeConfirmTitle', { name: child.displayName })}
        message={t('family.removeConfirmMsg')}
        confirmLabel={t('family.removeChild')}
        cancelLabel={t('common.cancel')}
        danger
        loading={remove.pending}
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
