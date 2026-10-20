import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { paths } from '@/routes/paths';
import { startPayment } from '../../api/payments';

interface Props {
	courseId: number;
	// Already formatted, e.g. "$49.99".
	price: string;
	className?: string;
}

// Starts the payment and sends the learner to the gateway. The mock gateway is
// our own /checkout page; a real one is an external URL.
export default function UnlockButton({ courseId, price, className }: Props) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [busy, setBusy] = useState(false);

	const unlock = async () => {
		setBusy(true);
		try {
			const payment = await startPayment(courseId);
			if (payment.provider === 'mock') {
				void navigate(paths.checkout(payment.id));
			} else if (payment.checkoutUrl) {
				window.location.assign(payment.checkoutUrl);
			}
		} catch {
			toast.error(t('courses.payError'));
			setBusy(false);
		}
	};

	return (
		<Button
			type="button"
			variant="gold"
			onClick={() => void unlock()}
			disabled={busy}
			className={className}>
			{busy ? t('courses.unlocking') : t('courses.unlock', { price })}
		</Button>
	);
}
