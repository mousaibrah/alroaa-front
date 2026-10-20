import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

// Notification toasts (use `toast.success(...)` from 'sonner'). The colours come
// from the brand theme (theme.css); the text direction follows the language.
const Toaster = (props: ToasterProps) => {
	const { i18n } = useTranslation();
	const dark = document.documentElement.classList.contains('dark');

	return (
		<Sonner
			theme={dark ? 'dark' : 'light'}
			dir={i18n.dir()}
			position="top-right"
			closeButton
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--success-bg': 'var(--success-soft)',
					'--success-text': 'var(--success-ink)',
					'--success-border': 'color-mix(in oklab, var(--success) 30%, transparent)',
					'--error-bg': 'var(--danger-soft)',
					'--error-text': 'var(--danger-ink)',
					'--error-border': 'color-mix(in oklab, var(--danger) 30%, transparent)',
					'--warning-bg': 'var(--warning-soft)',
					'--warning-text': 'var(--warning-ink)',
					'--warning-border': 'color-mix(in oklab, var(--warning) 30%, transparent)',
					'--info-bg': 'var(--info-soft)',
					'--info-text': 'var(--info-ink)',
					'--info-border': 'color-mix(in oklab, var(--info) 30%, transparent)',
					'--border-radius': 'var(--radius)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
