import { useNavigate } from 'react-router-dom';
import { useChildren } from '../hooks/useChildren';
import { ChildCard } from '../components/ChildCard';
import { PageHeader } from '../../../core/components/PageHeader';
import { PrimaryButton } from '../../../core/components/Button';
import { LoadingView } from '../../../core/components/LoadingView';
import { ErrorView } from '../../../core/components/ErrorView';
import { EmptyState } from '../../../core/components/EmptyState';

/** Parent Family tab: the list of children with an Add Child button (doc 06 §5.5). */
export function FamilyPage() {
  const navigate = useNavigate();
  const { children, loading, error } = useChildren();

  return (
    <div>
      <PageHeader
        title="Family"
        action={
          <PrimaryButton
            className="min-h-[44px] px-4"
            onClick={() => navigate('/parent/family/add')}
          >
            Add Child
          </PrimaryButton>
        }
      />

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && children.length === 0 && (
        <EmptyState
          icon="👶"
          message="Add your first child to get started."
        />
      )}

      {!loading && !error && children.length > 0 && (
        <div className="flex flex-col gap-3">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onClick={() => navigate(`/parent/family/${child.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
