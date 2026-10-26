import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { MailCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { paths } from '@/routes/paths';
import { resendVerification } from '../../api/auth';
import { ApiError } from '../../api/client';
import { verifyErrorKey } from '../../auth/authError';
import { useAuth } from '../../auth/useAuth';
import { ErrorBanner } from '../common/ErrorBanner';

const CODE_LENGTH = 6;

// What register and login pass along when the email still needs verifying.
export interface VerifyEmailState {
	email: string;
	resendAvailableIn: number;
	// Set when a session was ended for an unverified email: shows why, and
	// `sendCode` asks this screen to send the code (none was sent yet).
	sessionEnded?: boolean;
	sendCode?: boolean;
	// Where to go once verified (set by RequireAuth for a bounced guest).
	from?: { pathname: string; search?: string };
}

// The code screen: the 6-digit code from the email logs the user in.
export default function VerifyEmailForm() {
	const { t } = useTranslation();
	const { verifyEmail } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as VerifyEmailState | null;

	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [resending, setResending] = useState(false);
	const [cooldown, setCooldown] = useState(state?.resendAvailableIn ?? 0);

	// Logged out for an unverified email: send the code now (once, also under
	// StrictMode), then drop the flag so a reload doesn't send another.
	const sentOnOpen = useRef(false);
	useEffect(() => {
		if (!state?.email || !state.sendCode || sentOnOpen.current) return;
		sentOnOpen.current = true;
		resendVerification(state.email)
			.then(({ resendAvailableIn }) => resendAvailableIn)
			.catch((err) =>
				// A code went out less than a minute ago: it is still good.
				err instanceof ApiError && err.status === 429
					? Number(/(\d+)/.exec(err.message)?.[1] ?? 60)
					: 0
			)
			.then((resendAvailableIn) => {
				setCooldown(resendAvailableIn);
				const next: VerifyEmailState = { ...state, sendCode: false, resendAvailableIn };
				navigate(location.pathname, { replace: true, state: next });
			});
	}, [state, navigate, location.pathname]);

	// Counts the resend cooldown down to zero.
	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	// Opened directly (no email to verify): start from the login page.
	if (!state?.email) return <Navigate to={paths.login} replace />;
	const { email, from } = state;
	const destination = from ? `${from.pathname}${from.search ?? ''}` : paths.profile;

	const submit = async (value: string) => {
		if (value.length !== CODE_LENGTH || submitting) return;
		setError(null);
		setSubmitting(true);
		try {
			await verifyEmail({ email, code: value });
			toast.success(t('verify.success'));
			navigate(destination, { replace: true });
		} catch (err) {
			setError(verifyErrorKey(err));
			setCode('');
		} finally {
			setSubmitting(false);
		}
	};

	const resend = async () => {
		setError(null);
		setResending(true);
		try {
			const { resendAvailableIn } = await resendVerification(email);
			setCooldown(resendAvailableIn);
			setCode('');
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
					<MailCheck className="size-7" aria-hidden />
				</span>
				<CardTitle role="heading" aria-level={1} className="text-2xl font-bold">
					{t('verify.title')}
				</CardTitle>
				<CardDescription>
					{t('verify.description', { length: CODE_LENGTH })}{' '}
					<bdi dir="ltr" className="font-medium text-foreground">
						{email}
					</bdi>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void submit(code);
					}}
					noValidate
					className="space-y-5">
					{state.sessionEnded && (
						<Alert>
							<AlertDescription>{t('verify.sessionUnverified')}</AlertDescription>
						</Alert>
					)}
					<ErrorBanner message={error ? t(error as never) : null} />

					{/* Digits run left to right in Arabic too. */}
					<div dir="ltr" className="flex justify-center">
						<InputOTP
							maxLength={CODE_LENGTH}
							pattern={REGEXP_ONLY_DIGITS}
							inputMode="numeric"
							autoComplete="one-time-code"
							autoFocus
							aria-label={t('verify.codeLabel')}
							value={code}
							onChange={setCode}
							onComplete={(value: string) => void submit(value)}
							disabled={submitting}>
							<InputOTPGroup>
								{Array.from({ length: CODE_LENGTH }, (_, i) => (
									<InputOTPSlot
										key={i}
										index={i}
										aria-invalid={error ? true : undefined}
										className="size-12 text-lg"
									/>
								))}
							</InputOTPGroup>
						</InputOTP>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={submitting || code.length !== CODE_LENGTH}>
						{submitting ? t('verify.submitting') : t('verify.submit')}
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
							<Link to={paths.login} className="font-medium text-primary hover:underline">
								{t('verify.backToLogin')}
							</Link>
						</p>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
