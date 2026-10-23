import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { changeEmail } from '../../api/users';
import { useAuth } from '../../auth/useAuth';
import { emailSchema, type EmailFormValues } from '../../schemas/profile.schema';
import { ErrorBanner } from '../common/ErrorBanner';
import FormField from '../auth/FormField';
import { accountErrorKey } from './accountError';

// Changing the email needs the current password and signs out other devices.
export default function EmailForm({ currentEmail }: { currentEmail: string }) {
	const { t } = useTranslation();
	const { refreshSession } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: { email: '', currentPassword: '' },
	});

	const onSubmit = async (values: EmailFormValues) => {
		setError(null);
		try {
			await changeEmail(values);
			refreshSession();
			reset();
			toast.success(t('account.emailChanged'));
		} catch (err) {
			setError(accountErrorKey(err));
		}
	};

	return (
		<Card>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
					<div>
						<h2 className="text-xl font-bold text-primary-dark">{t('account.emailTitle')}</h2>
						<p className="text-sm text-muted-foreground">
							{t('account.currentEmail')} <bdi dir="ltr">{currentEmail}</bdi>
						</p>
					</div>
					<ErrorBanner message={error ? t(error as never) : null} />
					<FormField
						id="account-email"
						type="email"
						autoComplete="email"
						label={t('account.newEmail')}
						error={errors.email?.message}
						{...register('email')}
					/>
					<FormField
						id="account-email-password"
						type="password"
						autoComplete="current-password"
						label={t('account.currentPassword')}
						error={errors.currentPassword?.message}
						{...register('currentPassword')}
					/>
					<p className="text-xs text-muted-foreground">{t('account.signsOutOthers')}</p>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? t('admin.saving') : t('account.changeEmail')}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
