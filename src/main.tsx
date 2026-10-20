import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n/index';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import AppDirection from './components/layout/AppDirection';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* reducedMotion="user": animations are skipped for people who ask for less motion */}
		<LazyMotion features={domAnimation} strict>
			<MotionConfig reducedMotion="user">
				<BrowserRouter>
					<AuthProvider>
						<AppDirection>
							<App />
						</AppDirection>
					</AuthProvider>
				</BrowserRouter>
			</MotionConfig>
		</LazyMotion>
	</StrictMode>
);
