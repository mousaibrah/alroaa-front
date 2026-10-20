import { Alert, AlertDescription } from '@/components/ui/alert';

export function ErrorBanner({ message }: { message: string | null }) {
	if (!message) return null;
	return (
		<Alert variant="destructive" role="alert" className="motion-safe:animate-fade-in">
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}
