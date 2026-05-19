import { useMemo } from 'react'
import { Modal } from '../../../core/components/Modal'
import { TransactionList } from '../../../core/components/TransactionList'
import { LoadingView } from '../../../core/components/LoadingView'
import { firestoreService } from '../../../core/services/firestoreService'
import { useCollectionData } from '../../../core/hooks/useCollectionData'
import type { UserProfile } from '../../../models/userProfile'
import type { Transaction } from '../../../models/transaction'

interface StarHistoryModalProps {
  /** The child whose Star ledger to show. */
  child: UserProfile
  onClose: () => void
}

/** Admin dialog showing one child's full Star transaction ledger. */
export function StarHistoryModal({ child, onClose }: StarHistoryModalProps) {
  const query = useMemo(
    () => firestoreService.childTransactionsQuery(child.id),
    [child.id],
  )
  const { data: transactions, loading } = useCollectionData<Transaction>(query)

  return (
    <Modal open onClose={onClose} title={`${child.displayName} — Star history`}>
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <LoadingView />
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </Modal>
  )
}
