import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authErrorKey } from '../../auth/authError';
import { useAuth } from '../../auth/useAuth';
import { loginSchema, type LoginFormValues } from '../../schemas/login.schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBanner } from '../common/ErrorBanner';
import FormField from './FormField';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';

export default function LoginForm() {
	const { t } = useTranslation();
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	// Send the user back to the page that bounced them to /login.
	const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
	const destination = from ? `${from.pathname}${from.search ?? ''}` : paths.profile;

	const onSubmit = async (data: LoginFormValues) => {
		setServerError(null);
		try {
			await login(data);
			toast.success(t('toast.loggedIn'));
			navigate(destination, { replace: true });
		} catch (error) {
			setServerError(authErrorKey(error));
		}
	};

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle role="heading" aria-level={1} className="text-2xl font-bold">
					{t('login.title')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
					<ErrorBanner message={serverError ? t(serverError as never) : null} />

					<FormField
						id="email"
						type="email"
						autoComplete="email"
						label={t('auth.email')}
						placeholder={t('auth.emailPlaceholder')}
						error={errors.email?.message}
						{...register('email')}
					/>
					<FormField
						id="password"
						type="password"
						autoComplete="current-password"
						label={t('auth.password')}
						error={errors.password?.message}
						{...register('password')}
					/>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? t('login.submitting') : t('login.submit')}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						{t('login.noAccount')}{' '}
						<Link to={paths.register} state={location.state} className="font-medium text-primary hover:underline">
							{t('login.registerLink')}
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
