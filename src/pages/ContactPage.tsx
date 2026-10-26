import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Mail, MapPin, MessageCircle, Phone, Send, User, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sendContactMessage } from '../api';
import { ErrorBanner } from '../components/common/ErrorBanner';
import HeroSmall from '../components/site/HeroSmall';
import { CONTACT } from '../data/site';
import { usePageTitle } from '../hooks/usePageTitle';
import { contactSchema, type ContactFormValues } from '../schemas/contact.schema';
import { toast } from 'sonner';

// Leading icon of a form field (the input is padded to make room).
const ICON =
	'pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground';

const EMPTY: ContactFormValues = { name: '', phone: '', email: '', message: '', website: '' };

export default function ContactPage() {
	const { t } = useTranslation();
	usePageTitle(t('site.contact.pageTitle'));

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isSubmitted },
	} = useForm<ContactFormValues>({
		mode: 'onTouched',
		resolver: zodResolver(contactSchema),
		defaultValues: EMPTY,
	});

	const onSubmit = async (values: ContactFormValues) => {
		if (values.website) return; // bots fill the hidden field
		try {
			await sendContactMessage({
				fullName: values.name,
				phoneNumber: values.phone,
				email: values.email,
				message: values.message,
			});
			toast.success(t('site.contact.sent'));
			reset(EMPTY);
		} catch {
			toast.error(t('site.contact.errors.send'));
		}
	};

	const [phone1, phone2] = CONTACT.phones;
	// Quick ways to reach us, one card each; a card may list several links.
	const channels: {
		icon: LucideIcon;
		label: string;
		links: { value: string; href?: string }[];
	}[] = [
		{
			icon: MessageCircle,
			label: t('site.contact.whatsapp'),
			links: [{ value: `+${phone1}`, href: `https://wa.me/${phone1}` }],
		},
		{
			icon: Phone,
			label: t('site.contact.phone'),
			links: [
				{ value: `+${phone1}`, href: `tel:+${phone1}` },
				{ value: `+${phone2}`, href: `tel:+${phone2}` },
			],
		},
		{
			icon: Mail,
			label: t('site.contact.email'),
			links: [{ value: CONTACT.email, href: `mailto:${CONTACT.email}` }],
		},
		{
			icon: MapPin,
			label: t('site.contact.address'),
			links: [{ value: t('site.contact.addressValue') }],
		},
	];

	const fieldError = (message?: string) =>
		message && (
			<p role="alert" className="mt-1 text-sm text-destructive">
				{t(message as never)}
			</p>
		);

	return (
		<>
			<HeroSmall title={t('site.contact.title')} sub={t('site.contact.sub')} img="globe" />

			{/* Quick channels, overlapping the bottom edge of the hero band */}
			<section className="relative z-10 -mt-8 px-5">
				<ul className="reveal mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{channels.map(({ icon: Icon, label, links }) => (
						<li
							key={label}
							className="group flex items-start gap-4 rounded-2xl border border-brand-100 bg-card p-5 shadow-lg transition hover:-translate-y-1 hover:border-brand-secondary hover:shadow-xl">
							<span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary transition group-hover:bg-brand-secondary group-hover:text-brand-secondary-foreground">
								<Icon className="size-6" aria-hidden />
							</span>
							<div className="min-w-0">
								<div className="text-sm font-semibold text-primary-light">{label}</div>
								{links.map((l) =>
									l.href ? (
										<a
											key={l.value}
											dir="ltr"
											href={l.href}
											className="block break-words text-start font-bold text-primary-dark hover:text-primary hover:underline">
											{l.value}
										</a>
									) : (
										<div key={l.value} className="font-bold text-primary-dark">
											{l.value}
										</div>
									)
								)}
							</div>
						</li>
					))}
				</ul>
			</section>

			<section className="py-20">
				<div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-5">
					<form
						onSubmit={handleSubmit(onSubmit)}
						noValidate
						className="reveal space-y-5 rounded-3xl border border-brand-100 bg-card p-6 shadow-xl sm:p-8 lg:col-span-3">
						<header>
							<span className="mb-3 block h-1 w-12 rounded-full bg-brand-secondary" />
							<h2 className="text-2xl font-extrabold text-primary-dark">
								{t('site.contact.formTitle')}
							</h2>
							<p className="mt-1 text-muted-foreground">{t('site.contact.formSub')}</p>
						</header>

						{isSubmitted && Object.keys(errors).length > 0 && (
							<ErrorBanner message={t('site.contact.errors.invalid')} />
						)}

						{/* Honeypot: hidden from people */}
						<input
							type="text"
							tabIndex={-1}
							autoComplete="off"
							className="hidden"
							{...register('website')}
						/>

						<div className="grid gap-5 sm:grid-cols-2">
							<div className="grid gap-1.5">
								<Label htmlFor="contact-name">{t('site.contact.form.name')}</Label>
								<div className="relative">
									<User className={ICON} aria-hidden />
									<Input
										id="contact-name"
										autoComplete="name"
										className="ps-10"
										aria-invalid={!!errors.name}
										{...register('name')}
									/>
								</div>
								{fieldError(errors.name?.message)}
							</div>
							<div className="grid gap-1.5">
								<Label htmlFor="contact-phone">{t('site.contact.form.phone')}</Label>
								<div className="relative">
									<Phone className={ICON} aria-hidden />
									<Input
										id="contact-phone"
										type="tel"
										dir="ltr"
										autoComplete="tel"
										className="ps-10 text-start"
										aria-invalid={!!errors.phone}
										{...register('phone')}
									/>
								</div>
								{fieldError(errors.phone?.message)}
							</div>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="contact-email">{t('site.contact.form.email')}</Label>
							<div className="relative">
								<Mail className={ICON} aria-hidden />
								<Input
									id="contact-email"
									type="email"
									dir="ltr"
									autoComplete="email"
									className="ps-10 text-start"
									aria-invalid={!!errors.email}
									{...register('email')}
								/>
							</div>
							{fieldError(errors.email?.message)}
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="contact-message">{t('site.contact.form.message')}</Label>
							<Textarea
								id="contact-message"
								rows={6}
								aria-invalid={!!errors.message}
								{...register('message')}
							/>
							{fieldError(errors.message?.message)}
						</div>
						<Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
							<Send className="size-4 rtl:-scale-x-100" aria-hidden />
							{isSubmitting ? t('site.contact.form.sending') : t('site.contact.form.send')}
						</Button>
					</form>

					{/* Side panel: photo, a short promise and the social links */}
					<aside className="reveal relative isolate flex flex-col justify-between overflow-hidden rounded-3xl bg-primary-dark p-8 text-primary-foreground shadow-xl lg:col-span-2">
						<img
							src="/assets/img/cta.webp"
							alt=""
							className="absolute inset-0 -z-10 size-full object-cover opacity-25"
						/>
						<div>
							<span className="mb-4 block h-1 w-12 rounded-full bg-brand-secondary" />
							<h2 className="text-2xl font-extrabold">{t('site.contact.panelTitle')}</h2>
							<p className="mt-3 leading-8 text-primary-foreground/85">
								{t('site.contact.panelText')}
							</p>
							<Button
								asChild
								size="lg"
								className="mt-6 bg-brand-secondary text-brand-secondary-foreground hover:bg-brand-secondary/90">
								<a href={`https://wa.me/${phone1}`} target="_blank" rel="noopener noreferrer">
									<MessageCircle className="size-4" aria-hidden />
									{t('site.contact.whatsappCta')}
								</a>
							</Button>
						</div>
						<div className="mt-10">
							<div className="mb-3 text-sm font-semibold text-primary-foreground/80">
								{t('site.contact.followUs')}
							</div>
							<div className="flex flex-wrap gap-3">
								{Object.entries(CONTACT.social).map(([name, url]) => (
									<a
										key={name}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-lg border border-primary-foreground/30 px-4 py-1 text-sm transition hover:border-brand-secondary hover:bg-brand-secondary hover:text-brand-secondary-foreground">
										{name}
									</a>
								))}
							</div>
						</div>
					</aside>
				</div>
			</section>
		</>
	);
}
