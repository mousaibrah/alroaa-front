import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourse } from '../api/courses';
import { confirmMockPayment, getPayment } from '../api/payments';
import type { Payment } from '../types/enrollment';
import { formatPrice } from '../utils/format';
import { fetchQuery } from '@/lib/queryCache';
import { useApiQuery } from '../hooks/useApiQuery';
import { CheckoutSkeleton } from '../components/feedback/skeletons';
import { paths } from '@/routes/paths';
import { toast } from 'sonner';

// Stand-in for the payment gateway's hosted page (mock provider only). A real
// gateway redirects away from the app, and returns to the course page.
export default function CheckoutPage() {
	const { t, i18n } = useTranslation();
	const { paymentId } = useParams();
	const id = Number(paymentId);
	const [result, setResult] = useState<Payment | null>(null);
	const [busy, setBusy] = useState(false);

	const { data, error, loading } = useApiQuery(async (signal) => {
		const payment = await getPayment(id, signal);
		// The course page already loaded this course: reuse it if cached.
		const course = await fetchQuery(
			`course:${payment.courseId}`,
			() => getCourse(payment.courseId),
			60_000
		);
		return { payment, courseTitle: course.title };
	}, `checkout:${id}`);

	if (loading) return <CheckoutSkeleton />;
	if (error != null || !data) {
		return (
			<section className="text-center">
				<p className="mb-4 text-foreground">{t('checkout.loadError')}</p>
				<Link to={paths.courses} className="text-sm font-medium text-primary hover:underline">
					{t('courses.back')}
				</Link>
			</section>
		);
	}

	const payment = result ?? data.payment;
	const price = formatPrice(payment.amount, payment.currency, i18n.language);
	const coursePath = paths.course(payment.courseId);

	const pay = async () => {
		setBusy(true);
		try {
			setResult(await confirmMockPayment(id));
			toast.success(t('toast.paid'));
		} catch {
			toast.error(t('checkout.payError'));
		} finally {
			setBusy(false);
		}
	};

	return (
		<section className="mx-auto w-full max-w-md self-start py-8">
			<Card>
				<CardHeader>
					<CardTitle role="heading" aria-level={1} className="text-xl font-bold">
						{t('checkout.title')}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<dl className="space-y-2 text-sm">
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">{t('checkout.course')}</dt>
							<dd className="font-medium text-foreground">{data.courseTitle}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">{t('checkout.amount')}</dt>
							<dd className="font-semibold text-foreground">{price}</dd>
						</div>
					</dl>

					{payment.status === 'paid' ? (
						<div role="status" className="space-y-3 text-center motion-safe:animate-fade-up">
							<Alert className="border-success/30 bg-success-soft text-success-ink">
								<CheckCircle2 />
								<AlertTitle>{t('checkout.success')}</AlertTitle>
							</Alert>
							<p className="text-sm text-muted-foreground">{t('checkout.successBody')}</p>
							<Button asChild>
								<Link to={coursePath}>{t('checkout.toCourse')}</Link>
							</Button>
						</div>
					) : payment.status === 'pending' ? (
						<>
							<Alert className="border-warning/30 bg-warning-soft text-warning-ink">
								<AlertDescription className="text-warning-ink">
									{t('checkout.testNotice')}
								</AlertDescription>
							</Alert>
							<div className="flex flex-col gap-2">
								<Button
									type="button"
									onClick={() => void pay()}
									disabled={busy}
									className="bg-brand-secondary text-brand-secondary-foreground hover:bg-brand-secondary/90">
									{busy ? t('checkout.paying') : t('checkout.pay', { price })}
								</Button>
								<Button asChild variant="ghost">
									<Link to={coursePath}>{t('checkout.cancel')}</Link>
								</Button>
							</div>
						</>
					) : (
						<div className="space-y-3 text-center">
							<p role="alert" className="text-sm text-destructive">
								{t('checkout.failed')}
							</p>
							<Link to={coursePath} className="text-sm font-medium text-primary hover:underline">
								{t('checkout.toCourse')}
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	);
}
