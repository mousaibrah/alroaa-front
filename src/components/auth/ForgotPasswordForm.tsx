import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { paths } from '@/routes/paths';
import { forgotPassword } from '../../api/auth';
import { authErrorKey } from '../../auth/authError';
import {
	forgotPasswordSchema,
	type ForgotPasswordFormValues,
} from '../../schemas/password-reset.schema';
import { ErrorBanner } from '../common/ErrorBanner';
import FormField from './FormField';
import type { ResetPasswordState } from './ResetPasswordForm';

// What the login page passes along: the email typed so far, and the page
// that sent the user to log in.
export interface ForgotPasswordState {
	email?: string;
	from?: { pathname: string; search?: string };
}

// Asks for the email and sends a reset code to it, then opens the code screen.
export default function ForgotPasswordForm() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as ForgotPasswordState | null;
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordFormValues>({
		mode: 'onTouched',
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: state?.email ?? '' },
	});

	const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
		setServerError(null);
		try {
			const { resendAvailableIn } = await forgotPassword(email);
			const next: ResetPasswordState = { email, resendAvailableIn, from: state?.from };
			navigate(paths.resetPassword, { state: next });
		} catch (error) {
			setServerError(authErrorKey(error));
		}
	};

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle role="heading" aria-level={1} className="text-2xl font-bold">
					{t('forgot.title')}
				</CardTitle>
				<CardDescription>{t('forgot.description')}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
					<ErrorBanner message={serverError ? t(serverError as never) : null} />

					<FormField
						id="email"
						type="email"
						autoComplete="email"
						autoFocus
						label={t('auth.email')}
						placeholder={t('auth.emailPlaceholder')}
						error={errors.email?.message}
						{...register('email')}
					/>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? t('forgot.submitting') : t('forgot.submit')}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						<Link
							to={paths.login}
							state={state?.from ? { from: state.from } : undefined}
							className="font-medium text-primary hover:underline">
							{t('verify.backToLogin')}
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
