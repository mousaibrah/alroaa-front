import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import SiteLayout from '../layouts/SiteLayout';
import AboutPage from '../pages/AboutPage';
import AdminCoursePage from '../pages/AdminCoursePage';
import AdminPage from '../pages/AdminPage';
import AttemptPage from '../pages/AttemptPage';
import CheckoutPage from '../pages/CheckoutPage';
import ClientsPage from '../pages/ClientsPage';
import ContactPage from '../pages/ContactPage';
import CourseLearnPage from '../pages/CourseLearnPage';
import CourseOverviewPage from '../pages/CourseOverviewPage';
import CoursesPage from '../pages/CoursesPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProfilePage from '../pages/ProfilePage';
import VerifyCertificatePage from '../pages/VerifyCertificatePage';
import RegisterPage from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ServicesPage from '../pages/ServicesPage';
import GuestOnly from './guards/GuestOnly';
import RequireAuth from './guards/RequireAuth';
import { paths, routePatterns } from './paths';

export default function AppRoutes() {
	return (
		<Routes>
			{/* Public site: full-width sections, the header floats over a photo */}
			<Route element={<SiteLayout />}>
				<Route index element={<HomePage />} />
				<Route path={routePatterns.about} element={<AboutPage />} />
				<Route path={routePatterns.services} element={<ServicesPage />} />
				<Route path={routePatterns.clients} element={<ClientsPage />} />
				<Route path={routePatterns.contact} element={<ContactPage />} />
			</Route>

			{/* Platform: sign in, courses, profile, admin */}
			<Route element={<AppLayout />}>
				<Route element={<GuestOnly />}>
					<Route path={routePatterns.login} element={<LoginPage />} />
					<Route path={routePatterns.register} element={<RegisterPage />} />
					<Route path={routePatterns.verifyEmail} element={<VerifyEmailPage />} />
				</Route>

				{/* Browsing the catalogue is open to guests; the lessons are not */}
				<Route path={routePatterns.courses} element={<CoursesPage />} />
				<Route path={routePatterns.course} element={<CourseOverviewPage />} />
				{/* Anyone can check a certificate */}
				<Route path={routePatterns.verify} element={<VerifyCertificatePage />} />
				<Route path={routePatterns.verifyCode} element={<VerifyCertificatePage />} />

				{/* Add permissions to protect by role, e.g.
				    <Route element={<RequireAuth permissions={[Permission.COURSES_CREATE]} />}> */}
				<Route element={<RequireAuth />}>
					<Route path={routePatterns.profile} element={<ProfilePage />} />
					<Route path={routePatterns.learn} element={<CourseLearnPage />} />
					<Route path={routePatterns.attempt} element={<AttemptPage />} />
					<Route path={routePatterns.checkout} element={<CheckoutPage />} />
				</Route>

				{/* Admin area: requires the admin role */}
				<Route element={<RequireAuth roles={['admin']} />}>
					<Route path={routePatterns.admin} element={<AdminPage />} />
					<Route path={routePatterns.adminCourse} element={<AdminCoursePage />} />
				</Route>

				{/* The old dashboard is now the profile */}
				<Route
					path={routePatterns.legacyDashboard}
					element={<Navigate to={paths.profile} replace />}
				/>
				<Route path={routePatterns.forbidden} element={<ForbiddenPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
}
