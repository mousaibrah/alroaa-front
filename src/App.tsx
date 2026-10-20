import { Toaster } from '@/components/ui/sonner';
import AppRoutes from './routes/AppRoutes';

// Root of the page tree. App-wide providers live in main.tsx; the route table
// is in routes/AppRoutes.tsx and the URLs in routes/paths.ts. Notifications are
// shown with `toast` from 'sonner' (rendered by <Toaster /> below).
export default function App() {
	return (
		<>
			<AppRoutes />
			<Toaster />
		</>
	);
}
