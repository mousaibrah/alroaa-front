import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { changePassword } from '../../api/users';
import { useAuth } from '../../auth/useAuth';
import { passwordSchema, type PasswordFormValues } from '../../schemas/profile.schema';
import { ErrorBanner } from '../common/ErrorBanner';
import FormField from '../auth/FormField';
import { accountErrorKey } from './accountError';

// Changing the password needs the current one and signs out other devices.
export default function PasswordForm() {
	const { t } = useTranslation();
	const { refreshSession } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<PasswordFormValues>({
		mode: 'onTouched',
		resolver: zodResolver(passwordSchema),
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
	});

	const onSubmit = async (values: PasswordFormValues) => {
		setError(null);
		try {
			await changePassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});
			refreshSession();
			reset();
			toast.success(t('account.passwordChanged'));
		} catch (err) {
			setError(accountErrorKey(err));
		}
	};

	return (
		<Card>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
					<h2 className="text-xl font-bold text-primary-dark">{t('account.passwordTitle')}</h2>
					<ErrorBanner message={error ? t(error as never) : null} />
					<FormField
						id="account-current-password"
						type="password"
						autoComplete="current-password"
						label={t('account.currentPassword')}
						error={errors.currentPassword?.message}
						{...register('currentPassword')}
					/>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							id="account-new-password"
							type="password"
							autoComplete="new-password"
							label={t('account.newPassword')}
							error={errors.newPassword?.message}
							{...register('newPassword')}
						/>
						<FormField
							id="account-confirm-password"
							type="password"
							autoComplete="new-password"
							label={t('register.confirmPassword')}
							error={errors.confirmPassword?.message}
							{...register('confirmPassword')}
						/>
					</div>
					<p className="text-xs text-muted-foreground">{t('account.signsOutOthers')}</p>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? t('admin.saving') : t('account.changePassword')}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
