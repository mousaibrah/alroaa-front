import { zodResolver } from '@hookform/resolvers/zod';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { paths } from '@/routes/paths';
import { forgotPassword } from '../../api/auth';
import { verifyErrorKey } from '../../auth/authError';
import { useAuth } from '../../auth/useAuth';
import {
	resetPasswordSchema,
	type ResetPasswordFormValues,
} from '../../schemas/password-reset.schema';
import { ErrorBanner } from '../common/ErrorBanner';
import FormField from './FormField';

const CODE_LENGTH = 6;

// What the forgot password screen passes along once the code is sent.
export interface ResetPasswordState {
	email: string;
	resendAvailableIn: number;
	// Where to go once the password is reset (the page that asked to log in).
	from?: { pathname: string; search?: string };
}

// The emailed code and a new password: sets the password and logs the user in.
export default function ResetPasswordForm() {
	const { t } = useTranslation();
	const { resetPassword } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as ResetPasswordState | null;

	const [error, setError] = useState<string | null>(null);
	const [resending, setResending] = useState(false);
	const [cooldown, setCooldown] = useState(state?.resendAvailableIn ?? 0);

	const {
		control,
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormValues>({
		mode: 'onTouched',
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { code: '', newPassword: '', confirmPassword: '' },
	});

	// Counts the resend cooldown down to zero.
	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	// Opened directly (no email to reset): start from the forgot password page.
	if (!state?.email) return <Navigate to={paths.forgotPassword} replace />;
	const { email, from } = state;
	const destination = from ? `${from.pathname}${from.search ?? ''}` : paths.profile;

	const onSubmit = async (values: ResetPasswordFormValues) => {
		setError(null);
		try {
			await resetPassword({ email, code: values.code, newPassword: values.newPassword });
			toast.success(t('reset.success'));
			navigate(destination, { replace: true });
		} catch (err) {
			setError(verifyErrorKey(err));
			setValue('code', '');
		}
	};

	const resend = async () => {
		setError(null);
		setResending(true);
		try {
			const { resendAvailableIn } = await forgotPassword(email);
			setCooldown(resendAvailableIn);
			setValue('code', '');
			toast.success(t('verify.resent'));
		} catch (err) {
			setError(verifyErrorKey(err));
		} finally {
			setResending(false);
		}
	};

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="items-center text-center">
				<span className="mx-auto mb-2 grid size-14 place-items-center rounded-full bg-sand text-primary">
					<KeyRound className="size-7" aria-hidden />
				</span>
				<CardTitle role="heading" aria-level={1} className="text-2xl font-bold">
					{t('reset.title')}
				</CardTitle>
				<CardDescription>
					{t('reset.description', { length: CODE_LENGTH })}{' '}
					<bdi dir="ltr" className="font-medium text-foreground">
						{email}
					</bdi>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
					<ErrorBanner message={error ? t(error as never) : null} />

					<div className="grid gap-1.5">
						<Label htmlFor="reset-code" className="justify-center">
							{t('verify.codeLabel')}
						</Label>
						{/* Digits run left to right in Arabic too. */}
						<div dir="ltr" className="flex justify-center">
							<Controller
								control={control}
								name="code"
								render={({ field }) => (
									<InputOTP
										id="reset-code"
										maxLength={CODE_LENGTH}
										pattern={REGEXP_ONLY_DIGITS}
										inputMode="numeric"
										autoComplete="one-time-code"
										autoFocus
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										disabled={isSubmitting}>
										<InputOTPGroup>
											{Array.from({ length: CODE_LENGTH }, (_, i) => (
												<InputOTPSlot
													key={i}
													index={i}
													aria-invalid={error || errors.code ? true : undefined}
													className="size-12 text-lg"
												/>
											))}
										</InputOTPGroup>
									</InputOTP>
								)}
							/>
						</div>
						{errors.code?.message && (
							<p role="alert" className="text-center text-sm text-destructive">
								{t(errors.code.message as never)}
							</p>
						)}
					</div>

					<FormField
						id="reset-new-password"
						type="password"
						autoComplete="new-password"
						label={t('account.newPassword')}
						error={errors.newPassword?.message}
						{...register('newPassword')}
					/>
					<FormField
						id="reset-confirm-password"
						type="password"
						autoComplete="new-password"
						label={t('register.confirmPassword')}
						error={errors.confirmPassword?.message}
						{...register('confirmPassword')}
					/>
					<p className="text-xs text-muted-foreground">{t('reset.signsOutOthers')}</p>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? t('reset.submitting') : t('reset.submit')}
					</Button>

					<div className="space-y-2 text-center text-sm text-muted-foreground">
						<p>
							{t('verify.noCode')}{' '}
							<Button
								type="button"
								variant="link"
								className="h-auto p-0"
								disabled={cooldown > 0 || resending}
								onClick={() => void resend()}>
								{cooldown > 0
									? t('verify.resendIn', { seconds: cooldown })
									: resending
										? t('verify.resending')
										: t('verify.resend')}
							</Button>
						</p>
						<p>
							<Link
								to={paths.login}
								state={from ? { from } : undefined}
								className="font-medium text-primary hover:underline">
								{t('verify.backToLogin')}
							</Link>
						</p>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
