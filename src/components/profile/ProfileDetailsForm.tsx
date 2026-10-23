import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { updateProfile, uploadProfileImage } from '../../api/users';
import { useAuth } from '../../auth/useAuth';
import { IMAGE_TYPES, MAX_IMAGE_MB } from '../../schemas/register.schema';
import { profileSchema, today, type ProfileFormValues } from '../../schemas/profile.schema';
import type { User } from '../../types/auth';
import { ErrorBanner } from '../common/ErrorBanner';
import SimpleSelect from '../common/SimpleSelect';
import FormField from '../auth/FormField';
import { accountErrorKey } from './accountError';

// Name, gender, date of birth and the profile picture. No password needed.
export default function ProfileDetailsForm({ user }: { user: User }) {
	const { t } = useTranslation();
	const { refreshSession } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: user.firstName,
			lastName: user.lastName,
			gender: user.gender === null ? 'none' : (String(user.gender) as '0' | '1'),
			dob: user.dob ?? '',
		},
	});

	const onSubmit = async (values: ProfileFormValues) => {
		setError(null);
		try {
			await updateProfile({
				firstName: values.firstName,
				lastName: values.lastName,
				gender: values.gender === 'none' ? null : (Number(values.gender) as 0 | 1),
				dob: values.dob || null,
			});
			refreshSession();
			reset(values);
			toast.success(t('toast.saved'));
		} catch (err) {
			setError(accountErrorKey(err));
		}
	};

	// The picture is saved as soon as it is picked.
	const onPicture = async (file: File | undefined) => {
		if (fileInput.current) fileInput.current.value = '';
		if (!file) return;
		setError(null);
		if (!IMAGE_TYPES.includes(file.type)) return setError('validation.imageType');
		if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError('validation.imageSize');
		setUploading(true);
		try {
			await uploadProfileImage(file);
			refreshSession();
			toast.success(t('account.pictureSaved'));
		} catch (err) {
			setError(accountErrorKey(err));
		} finally {
			setUploading(false);
		}
	};

	const initial = (user.firstName || '?').charAt(0).toUpperCase();

	return (
		<Card>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
					<h2 className="text-xl font-bold text-primary-dark">{t('account.detailsTitle')}</h2>
					<ErrorBanner message={error ? t(error as never, { mb: MAX_IMAGE_MB }) : null} />

					<div className="flex items-center gap-4">
						<label
							htmlFor="profile-image"
							className="relative grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-primary/30 bg-sand text-2xl font-bold text-primary transition hover:border-primary">
							{user.image ? (
								<img src={user.image} alt="" className="size-full object-cover" />
							) : (
								<span aria-hidden>{initial}</span>
							)}
							<span className="absolute bottom-0 grid w-full place-items-center bg-black/40 py-0.5 text-white">
								<Camera className="size-3.5" aria-hidden />
							</span>
							<span className="sr-only">{t('account.changePicture')}</span>
						</label>
						<input
							ref={fileInput}
							id="profile-image"
							type="file"
							accept={IMAGE_TYPES.join(',')}
							className="sr-only"
							disabled={uploading}
							onChange={(e) => void onPicture(e.target.files?.[0])}
						/>
						<div className="text-sm">
							<p className="font-medium text-foreground">
								{uploading ? t('account.uploading') : t('account.changePicture')}
							</p>
							<p className="text-xs text-muted-foreground">
								{t('register.imageHint', { mb: MAX_IMAGE_MB })}
							</p>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							id="profile-firstName"
							autoComplete="given-name"
							label={t('register.firstName')}
							error={errors.firstName?.message}
							{...register('firstName')}
						/>
						<FormField
							id="profile-lastName"
							autoComplete="family-name"
							label={t('register.lastName')}
							error={errors.lastName?.message}
							{...register('lastName')}
						/>
						<div className="grid gap-1.5">
							<Label htmlFor="profile-gender">{t('profile.gender')}</Label>
							<Controller
								control={control}
								name="gender"
								render={({ field }) => (
									<SimpleSelect
										id="profile-gender"
										value={field.value}
										onValueChange={field.onChange}
										options={[
											{ value: 'none', label: t('profile.notSet') },
											{ value: '0', label: t('gender.male') },
											{ value: '1', label: t('gender.female') },
										]}
									/>
								)}
							/>
						</div>
						<FormField
							id="profile-dob"
							type="date"
							autoComplete="bday"
							min="1900-01-01"
							max={today()}
							label={t('profile.dob')}
							error={errors.dob?.message}
							{...register('dob')}
						/>
					</div>

					<Button type="submit" disabled={isSubmitting || !isDirty}>
						{isSubmitting ? t('admin.saving') : t('admin.save')}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
