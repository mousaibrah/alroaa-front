import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authErrorKey } from '../../auth/authError';
import { useAuth } from '../../auth/useAuth';
import { registerSchema, type RegisterFormValues } from '../../schemas/register.schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '../common/ErrorBanner';
import FormField from './FormField';
import SimpleSelect from '../common/SimpleSelect';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';

export default function RegisterForm() {
	const { t } = useTranslation();
	const { register: registerUser } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	// Where a guest was heading before being asked to sign up (see RequireAuth).
	const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
	const destination = from ? `${from.pathname}${from.search ?? ''}` : paths.profile;
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
			role: 'student',
		},
	});

	const onSubmit = async (values: RegisterFormValues) => {
		setServerError(null);
		try {
			// The backend signs the user in on register, so go straight in.
			await registerUser({
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				password: values.password,
				role: values.role,
			});
			toast.success(t('toast.registered'));
			navigate(destination, { replace: true });
		} catch (error) {
			setServerError(authErrorKey(error));
		}
	};

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle role="heading" aria-level={1} className="text-2xl font-bold">
					{t('register.title')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
					<ErrorBanner message={serverError ? t(serverError as never) : null} />

					<div className="grid grid-cols-2 gap-4">
						<FormField
							id="firstName"
							autoComplete="given-name"
							label={t('register.firstName')}
							error={errors.firstName?.message}
							{...register('firstName')}
						/>
						<FormField
							id="lastName"
							autoComplete="family-name"
							label={t('register.lastName')}
							error={errors.lastName?.message}
							{...register('lastName')}
						/>
					</div>
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
						autoComplete="new-password"
						label={t('auth.password')}
						error={errors.password?.message}
						{...register('password')}
					/>
					<FormField
						id="confirmPassword"
						type="password"
						autoComplete="new-password"
						label={t('register.confirmPassword')}
						error={errors.confirmPassword?.message}
						{...register('confirmPassword')}
					/>

					<div className="grid gap-1.5">
						<Label htmlFor="role">{t('register.role')}</Label>
						<Controller
							name="role"
							control={control}
							render={({ field }) => (
								<SimpleSelect
									id="role"
									value={field.value}
									onValueChange={field.onChange}
									options={[
										{ value: 'student', label: t('roles.student') },
										{ value: 'instructor', label: t('roles.instructor') },
									]}
								/>
							)}
						/>
					</div>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? t('register.submitting') : t('register.submit')}
					</Button>

					<p className="text-center text-sm text-muted-foreground">
						{t('register.haveAccount')}{' '}
						<Link to={paths.login} state={location.state} className="font-medium text-primary hover:underline">
							{t('register.loginLink')}
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
