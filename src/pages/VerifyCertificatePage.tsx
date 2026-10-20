import { BadgeCheck, Printer, Search, ShieldX } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paths } from '@/routes/paths';
import { ApiError } from '../api/client';
import { verifyCertificate } from '../api/certificates';
import CertificateCard from '../components/certificate/CertificateCard';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Skeleton } from '../components/feedback/Skeleton';
import { useApiQuery } from '../hooks/useApiQuery';
import { usePageTitle } from '../hooks/usePageTitle';

// Public page: type a certificate code (or open /verify/<code>, the address
// printed on the certificate) and see whether it is genuine.
export default function VerifyCertificatePage() {
	const { t } = useTranslation();
	usePageTitle(t('certificate.title'));
	const { code = '' } = useParams();
	const navigate = useNavigate();
	const [input, setInput] = useState(code);

	const result = useApiQuery((signal) => verifyCertificate(code, signal), `certificate:${code}`, {
		enabled: code !== '',
	});

	const submit = (e: FormEvent) => {
		e.preventDefault();
		const value = input.trim();
		if (value) void navigate(paths.verifyCode(value));
	};

	const notFound = result.error instanceof ApiError && result.error.status === 404;

	return (
		<section className="w-full max-w-4xl space-y-8 self-start px-1 py-6">
			<header>
				<span className="mb-4 block h-1 w-14 rounded-full bg-brand-secondary" />
				<h1 className="text-3xl font-extrabold text-primary-dark md:text-4xl">
					{t('certificate.title')}
				</h1>
				<p className="mt-3 text-muted-foreground">{t('certificate.sub')}</p>
			</header>

			<form
				onSubmit={submit}
				className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-xs print:hidden">
				<div className="grid min-w-64 flex-1 gap-1.5">
					<Label htmlFor="certificate-code">{t('certificate.codeLabel')}</Label>
					<Input
						id="certificate-code"
						dir="ltr"
						autoComplete="off"
						spellCheck={false}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={t('certificate.codePlaceholder')}
						className="text-start uppercase placeholder:normal-case"
					/>
				</div>
				<Button type="submit" size="lg" disabled={!input.trim()}>
					<Search className="size-4" aria-hidden />
					{t('certificate.check')}
				</Button>
			</form>

			{code !== '' && result.loading && !result.data && (
				<div role="status" aria-label={t('certificate.checking')}>
					<Skeleton className="h-96 w-full" />
				</div>
			)}

			{result.data && (
				<div className="space-y-6">
					<div
						role="status"
						className="flex items-start gap-3 rounded-2xl bg-success-soft p-4 text-success-ink print:hidden">
						<BadgeCheck className="mt-0.5 size-6 shrink-0" aria-hidden />
						<div>
							<p className="font-bold">{t('certificate.valid')}</p>
							<p className="text-sm">{t('certificate.validSub')}</p>
						</div>
					</div>
					<CertificateCard certificate={result.data} />
					<div className="flex justify-center print:hidden">
						<Button type="button" variant="outline" onClick={() => window.print()}>
							<Printer className="size-4" aria-hidden />
							{t('certificate.print')}
						</Button>
					</div>
				</div>
			)}

			{!result.data && notFound && (
				<div
					role="alert"
					className="flex items-start gap-3 rounded-2xl bg-danger-soft p-4 text-danger-ink">
					<ShieldX className="mt-0.5 size-6 shrink-0" aria-hidden />
					<p className="font-medium">{t('certificate.notFound')}</p>
				</div>
			)}
			{!result.data && result.error != null && !notFound && (
				<ErrorBanner message={t('certificate.loadError')} />
			)}
		</section>
	);
}
