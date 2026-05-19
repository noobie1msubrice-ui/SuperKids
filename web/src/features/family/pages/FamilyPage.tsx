import { useNavigate } from 'react-router-dom';
import { useChildren } from '../hooks/useChildren';
import { ChildCard } from '../components/ChildCard';
import { useTranslation } from '../../../core/i18n/LanguageContext';
import { PageHeader } from '../../../core/components/PageHeader';
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button';
import { LoadingView } from '../../../core/components/LoadingView';
import { ErrorView } from '../../../core/components/ErrorView';
import { EmptyState } from '../../../core/components/EmptyState';

/** Parent Family tab: the list of children with an Add Child button (doc 06 §5.5). */
export function FamilyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { children, loading, error } = useChildren();

  return (
    <div>
      <PageHeader
        title={t('family.title')}
        action={
          <PrimaryButton
            className="min-h-[44px] px-4"
            onClick={() => navigate('/parent/family/add')}
          >
            {t('family.addChild')}
          </PrimaryButton>
        }
      />

      <SecondaryButton
        fullWidth
        className="mb-4 min-h-[44px]"
        onClick={() => navigate('/parent/family/link')}
      >
        {t('family.linkChild')}
      </SecondaryButton>

      {loading && <LoadingView />}
      {error && <ErrorView />}

      {!loading && !error && children.length === 0 && (
        <EmptyState icon="👶" message={t('family.empty')} />
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
