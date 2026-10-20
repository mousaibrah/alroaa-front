import { Card, CardContent } from '@/components/ui/card';
import { LoadingRegion, Skeleton } from './Skeleton';

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<LoadingRegion>
			<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: count }, (_, i) => (
					<li key={i} className="flex">
						<Card className="h-full w-full gap-0 py-0">
							<Skeleton className="aspect-video w-full rounded-none" />
							<CardContent className="space-y-3 py-4">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-3 w-2/3" />
								<Skeleton className="mt-4 h-4 w-16" />
							</CardContent>
						</Card>
					</li>
				))}
			</ul>
		</LoadingRegion>
	);
}

export function CourseDetailSkeleton() {
	return (
		<LoadingRegion className="w-full max-w-5xl self-start py-4">
			<Skeleton className="h-4 w-32" />
			<Skeleton className="mt-4 h-7 w-1/2" />
			<Skeleton className="mt-3 h-4 w-2/3" />
			<div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
				<Card className="gap-0 py-0">
					<Skeleton className="aspect-video w-full rounded-none" />
					<CardContent className="space-y-3 py-4">
						<Skeleton className="h-5 w-1/3" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-4/5" />
					</CardContent>
				</Card>
				<div className="space-y-4">
					{[0, 1].map((section) => (
						<Card key={section} className="gap-0 py-0">
							<div className="border-b bg-muted/50 px-4 py-3">
								<Skeleton className="h-4 w-1/2" />
							</div>
							{[0, 1, 2].map((row) => (
								<div key={row} className="flex items-center gap-3 px-4 py-3">
									<Skeleton className="size-5 rounded-full" />
									<Skeleton className="h-3 flex-1" />
									<Skeleton className="h-3 w-8" />
								</div>
							))}
						</Card>
					))}
				</div>
			</div>
		</LoadingRegion>
	);
}

// Rows of a table or list (admin pages).
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
	return (
		<LoadingRegion>
			<Card className="gap-0 divide-y py-0">
				{Array.from({ length: rows }, (_, i) => (
					<div key={i} className="flex items-center gap-4 px-4 py-4">
						<Skeleton className="h-4 flex-1" />
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-6 w-16 rounded-full" />
					</div>
				))}
			</Card>
		</LoadingRegion>
	);
}

export function AdminCourseSkeleton() {
	return (
		<LoadingRegion className="w-full max-w-5xl self-start py-4">
			<Skeleton className="h-4 w-28" />
			<div className="mt-4 flex items-center justify-between gap-4">
				<Skeleton className="h-7 w-1/3" />
				<Skeleton className="h-9 w-32" />
			</div>
			<Skeleton className="mt-6 h-9 w-72" />
			<div className="mt-4">
				<ListSkeleton rows={4} />
			</div>
		</LoadingRegion>
	);
}

export function QuestionsSkeleton() {
	return (
		<LoadingRegion className="mx-auto w-full max-w-3xl space-y-4 py-4">
			<Card>
				<CardContent className="space-y-3">
					<Skeleton className="h-5 w-1/3" />
					<Skeleton className="h-2 w-full rounded-full" />
				</CardContent>
			</Card>
			{[0, 1, 2].map((q) => (
				<Card key={q}>
					<CardContent className="space-y-3">
						<Skeleton className="h-4 w-2/3" />
						{[0, 1, 2].map((o) => (
							<Skeleton key={o} className="h-10 w-full rounded-lg" />
						))}
					</CardContent>
				</Card>
			))}
		</LoadingRegion>
	);
}

export function CheckoutSkeleton() {
	return (
		<LoadingRegion className="mx-auto w-full max-w-md self-start py-8">
			<Card>
				<CardContent className="space-y-5">
					<Skeleton className="h-6 w-1/3" />
					<div className="space-y-3">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
					</div>
					<Skeleton className="h-10 w-full rounded-lg" />
				</CardContent>
			</Card>
		</LoadingRegion>
	);
}
