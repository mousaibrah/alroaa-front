// Every URL of the app in one place. Use these instead of typing paths in
// links and redirects, so a route can be renamed here and nowhere else.
export const paths = {
	home: '/',
	about: '/about',
	services: '/services',
	clients: '/clients',
	contact: '/contact',
	login: '/login',
	register: '/register',
	profile: '/profile',
	// kept so old links and bookmarks still work
	legacyDashboard: '/dashboard',
	courses: '/courses',
	// Certificate check: the form, and a certificate by its code
	verify: '/verify',
	verifyCode: (code: string) => `/verify/${encodeURIComponent(code)}`,
	forbidden: '/forbidden',
	admin: '/admin',
	// A service on the services page, e.g. /services#audit
	service: (id: string) => `/services#${id}`,
	course: (id: number | string) => `/courses/${id}`,
	// The lessons player of a program (the overview is `course`).
	learn: (id: number | string) => `/courses/${id}/learn`,
	adminCourse: (id: number | string) => `/admin/courses/${id}`,
	attempt: (id: number | string) => `/attempts/${id}`,
	checkout: (id: number | string) => `/checkout/${id}`,
} as const;

// The same routes as patterns for <Route path>, relative to the main layout.
// The parameter names are what pages read with useParams().
export const routePatterns = {
	about: 'about',
	services: 'services',
	clients: 'clients',
	contact: 'contact',
	login: 'login',
	register: 'register',
	profile: 'profile',
	legacyDashboard: 'dashboard',
	courses: 'courses',
	verify: 'verify',
	verifyCode: 'verify/:code',
	course: 'courses/:id',
	learn: 'courses/:id/learn',
	attempt: 'attempts/:attemptId',
	checkout: 'checkout/:paymentId',
	admin: 'admin',
	adminCourse: 'admin/courses/:id',
	forbidden: 'forbidden',
} as const;
