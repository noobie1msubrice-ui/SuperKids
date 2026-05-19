import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { functionsService } from '../../../core/services/functionsService';
import { useAction } from '../../../core/hooks/useAction';
import { useTranslation } from '../../../core/i18n/LanguageContext';
import { PageHeader } from '../../../core/components/PageHeader';
import { TextField } from '../../../core/components/TextField';
import { PrimaryButton, SecondaryButton } from '../../../core/components/Button';
import { FormError } from '../../../core/components/FormError';
import { Card } from '../../../core/components/Card';
import { rules } from '../../../core/utils/validators';

interface LinkChildForm {
  email: string;
}

/**
 * Parent claims a self-registered kid by their sign-up email, via the
 * linkChildToParent function (the counterpart to Add a Child).
 */
export function LinkChildPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkChildForm>();
  const { run, pending, error } = useAction(functionsService.linkChildToParent);
  const [linkedName, setLinkedName] = useState<string | null>(null);

  async function onSubmit(data: LinkChildForm): Promise<void> {
    const result = await run({ email: data.email.trim() });
    if (result) {
      setLinkedName(result.displayName);
    }
  }

  // Confirmation: the kid is now in the family.
  if (linkedName !== null) {
    return (
      <div>
        <PageHeader title={t('family.kidLinked')} />
        <Card>
          <p className="mb-5 text-body">
            {t('family.kidLinkedMsg', { name: linkedName })}
          </p>
          <PrimaryButton fullWidth onClick={() => navigate('/parent/family')}>
            {t('common.done')}
          </PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t('family.linkAKid')} />
      <Card>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <p className="text-body text-textMuted">{t('family.linkIntro')}</p>
          <FormError message={error} />
          <TextField
            label={t('family.kidSignupEmail')}
            type="email"
            error={errors.email?.message}
            {...register('email', rules.email)}
          />
          <div className="flex gap-3">
            <SecondaryButton
              type="button"
              fullWidth
              onClick={() => navigate('/parent/family')}
              disabled={pending}
            >
              {t('common.cancel')}
            </SecondaryButton>
            <PrimaryButton type="submit" fullWidth loading={pending}>
              {t('family.linkChild')}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
