import { useTranslation } from 'react-i18next';
import { paths } from '@/routes/paths';
import type { Certificate } from '../../types/certificates';

// "8 learning hours", or minutes for short programs (same wording as the course page).
function learningTime(seconds: number, t: (key: never, options?: object) => string): string {
	const minutes = Math.round(seconds / 60);
	return minutes < 60
		? t('courses.durationMinutes' as never, { value: Math.max(minutes, 1) })
		: t('courses.durationHours' as never, { value: Math.round(minutes / 6) / 10 });
}

// The printable certificate. The `certificate-print` class is what the print
// stylesheet (index.css) keeps on the page.
export default function CertificateCard({ certificate }: { certificate: Certificate }) {
	const { t, i18n } = useTranslation();
	const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
		new Date(certificate.issuedAt)
	);
	const url = `${window.location.origin}${paths.verifyCode(certificate.code)}`;

	return (
		<article
			aria-label={t('certificate.heading')}
			className="certificate-print mx-auto w-full max-w-3xl border-2 border-brand-secondary/70 bg-ivory p-2 shadow-xl">
			<div className="flex min-h-[28rem] flex-col border border-brand-secondary/50 px-6 py-8 text-center sm:px-14">
				<div className="flex items-center gap-3 self-start">
					<img src="/assets/img/logo-mark.png" alt="" className="size-12" />
					<span className="text-start leading-tight">
						<b className="block text-lg text-primary-dark">{t('common.appName')}</b>
						<small className="text-xs text-muted-foreground">{t('common.appTagline')}</small>
					</span>
				</div>

				<div className="my-auto space-y-3 py-8">
					<p className="text-sm text-muted-foreground">{t('certificate.issuer')}</p>
					<h2 className="text-3xl font-extrabold text-primary-dark sm:text-4xl">
						{t('certificate.heading')}
					</h2>
					<p className="pt-3 text-muted-foreground">{t('certificate.certifies')}</p>
					<p className="text-2xl font-extrabold text-primary-dark">{certificate.holderName}</p>
					<p className="pt-2 text-muted-foreground">{t('certificate.completed')}</p>
					<p className="text-2xl font-extrabold text-primary-dark">{certificate.courseTitle}</p>
					<p className="pt-3 text-muted-foreground">
						{t('certificate.learningTime', {
							time: learningTime(certificate.learningSeconds, t as never),
							date,
						})}
					</p>
				</div>

				<div className="space-y-1 text-sm text-muted-foreground">
					<p className="font-semibold text-primary-dark">
						{t('certificate.number', {
							code: certificate.code,
							interpolation: { escapeValue: false },
						})}
					</p>
					<p className="break-all">{t('certificate.verifyAt', { url })}</p>
				</div>
			</div>
		</article>
	);
}
