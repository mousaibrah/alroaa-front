import { useId, useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FileImage, FileVideo, RotateCcw, TriangleAlert, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { mimeTypeOf } from '../../api/uploads';
import type { MediaUpload } from '../../hooks/useMediaUpload';
import { formatBytes, formatDuration } from '../../utils/format';

interface Props {
	label: string;
	kind: 'video' | 'image';
	// Comma-separated MIME types, as for <input accept>.
	accept: string;
	upload: MediaUpload;
	invalid?: boolean;
}

// Drop or pick a file; it uploads right away and shows progress, speed and the
// time left, with cancel and retry.
export default function MediaUploadField({ label, kind, accept, upload, invalid }: Props) {
	const { t, i18n } = useTranslation();
	const inputId = useId();
	const input = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);
	const [rejected, setRejected] = useState<string | null>(null);
	const allowed = accept.split(',');
	const Icon = kind === 'video' ? FileVideo : FileImage;
	const bytes = (n: number) => formatBytes(n, i18n.language);

	const pick = (file: File | undefined) => {
		if (!file) return;
		if (!allowed.includes(mimeTypeOf(file))) {
			setRejected(t(`admin.upload.wrongType.${kind}`));
			return;
		}
		setRejected(null);
		upload.start(file);
	};

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		setDragging(false);
		pick(e.dataTransfer.files[0]);
	};

	const browse = () => input.current?.click();

	const { status, file, loaded, speed } = upload;
	const total = file?.size ?? 0;
	const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
	const secondsLeft = speed ? Math.ceil((total - loaded) / speed) : null;

	return (
		<div className="space-y-1.5">
			<label htmlFor={inputId} className="text-sm font-medium">
				{label}
			</label>
			<input
				ref={input}
				id={inputId}
				type="file"
				accept={accept}
				className="sr-only"
				// Picking the same file again after a reset must fire onChange.
				onClick={(e) => (e.currentTarget.value = '')}
				onChange={(e) => pick(e.target.files?.[0])}
			/>

			{status === 'idle' ? (
				<div
					role="button"
					tabIndex={0}
					onClick={browse}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							browse();
						}
					}}
					onDragOver={(e) => {
						e.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={onDrop}
					aria-invalid={invalid || !!rejected}
					className={cn(
						'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed bg-background px-4 py-6 text-center transition-colors outline-none',
						'hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50',
						dragging ? 'border-primary bg-primary/10' : 'border-border',
						(invalid || rejected) && 'border-destructive/60'
					)}>
					<span
						className={cn(
							'grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition-transform',
							dragging && 'scale-110'
						)}>
						<UploadCloud className="size-5" aria-hidden />
					</span>
					<p className="text-sm">
						{t(`admin.upload.drop.${kind}`)}{' '}
						<span className="font-medium text-primary underline-offset-4 hover:underline">
							{t('admin.upload.browse')}
						</span>
					</p>
					<p className="text-xs text-muted-foreground">{t(`admin.upload.types.${kind}`)}</p>
				</div>
			) : (
				<div
					className={cn(
						'flex items-start gap-3 rounded-lg border bg-background p-3',
						status === 'error' && 'border-destructive/40 bg-destructive/5'
					)}>
					<span
						className={cn(
							'grid size-10 shrink-0 place-items-center rounded-md',
							status === 'done' && 'bg-success-soft text-success-ink',
							status === 'error' && 'bg-destructive/10 text-destructive',
							status === 'uploading' && 'bg-primary/10 text-primary'
						)}>
						{status === 'done' ? (
							<CheckCircle2 className="size-5" aria-hidden />
						) : status === 'error' ? (
							<TriangleAlert className="size-5" aria-hidden />
						) : (
							<Icon className="size-5" aria-hidden />
						)}
					</span>

					<div className="min-w-0 flex-1 space-y-1.5">
						<div className="flex items-baseline justify-between gap-2">
							<p className="truncate text-sm font-medium" dir="auto" title={file?.name}>
								{file?.name}
							</p>
							{status === 'uploading' && (
								<span className="shrink-0 text-sm font-medium tabular-nums">
									{percent.toLocaleString(i18n.language)}%
								</span>
							)}
						</div>

						{status === 'uploading' && (
							<>
								<Progress
									value={percent}
									aria-label={t('admin.upload.progress')}
									className="h-2 [&_[data-slot=progress-indicator]]:duration-200"
								/>
								<p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
									{t('admin.upload.ofTotal', { loaded: bytes(loaded), total: bytes(total) })}
									{speed != null && (
										<>
											{' · '}
											{formatBytes(speed, i18n.language, true)}
											{secondsLeft != null &&
												secondsLeft > 0 &&
												` · ${t('admin.upload.timeLeft', { time: formatDuration(secondsLeft) })}`}
										</>
									)}
								</p>
							</>
						)}
						{status === 'done' && (
							<p className="text-xs text-muted-foreground">
								{bytes(total)} · {t('admin.upload.done')}
							</p>
						)}
						{status === 'error' && (
							<p className="text-xs text-destructive" role="alert">
								{upload.error}
							</p>
						)}
					</div>

					<div className="flex shrink-0 gap-1">
						{status === 'error' && (
							<Button type="button" variant="outline" size="sm" onClick={upload.retry}>
								<RotateCcw aria-hidden />
								{t('admin.upload.retry')}
							</Button>
						)}
						{status === 'done' && (
							<Button type="button" variant="ghost" size="sm" onClick={browse}>
								{t('admin.upload.replace')}
							</Button>
						)}
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={upload.reset}
							aria-label={t(status === 'uploading' ? 'admin.upload.cancel' : 'admin.upload.remove')}
							title={t(status === 'uploading' ? 'admin.upload.cancel' : 'admin.upload.remove')}>
							<X aria-hidden />
						</Button>
					</div>
				</div>
			)}
			{rejected && (
				<p className="text-xs text-destructive" role="alert">
					{rejected}
				</p>
			)}
		</div>
	);
}
