import { clsx } from 'clsx';
import type { Transaction } from '../../models/transaction';
import { formatDate } from '../utils/formatters';
import { useTranslation } from '../i18n/LanguageContext';
import { EmptyState } from './EmptyState';

interface TransactionListProps {
  transactions: Transaction[];
}

/** A Star ledger: each earn (green +) or spend (orange −) with reason and date. */
export function TransactionList({ transactions }: TransactionListProps) {
  const { t } = useTranslation();
  if (transactions.length === 0) {
    return <EmptyState icon="✨" message={t('profile.noActivity')} />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {transactions.map((txn) => {
        const isEarn = txn.type === 'earn';
        return (
          <li
            key={txn.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
          >
            <div className="min-w-0">
              <p className="truncate text-body font-semibold">{txn.reason}</p>
              <p className="text-caption text-textMuted">
                {formatDate(txn.createdAt)}
              </p>
            </div>
            <span
              className={clsx(
                'shrink-0 text-section font-bold',
                isEarn ? 'text-success' : 'text-secondary',
              )}
            >
              {isEarn ? '+' : '−'}
              {txn.amount} ⭐
            </span>
          </li>
        );
      })}
    </ul>
  );
}
