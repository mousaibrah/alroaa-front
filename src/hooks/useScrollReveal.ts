import { useEffect } from 'react';

// Fades in every element with the `.reveal` class the first time it scrolls into
// view (styles in styles/site.css). Re-runs when `key` changes, e.g. on a new
// page. People who prefer reduced motion see everything at once (CSS).
export function useScrollReveal(key: string): void {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) =>
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				}),
			{ threshold: 0.12 }
		);
		document.querySelectorAll<HTMLElement>('.reveal').forEach((el, i) => {
			el.style.transitionDelay = `${(i % 4) * 90}ms`;
			observer.observe(el);
		});
		return () => observer.disconnect();
	}, [key]);
}
