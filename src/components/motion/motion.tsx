import { animate, m, useReducedMotion, type Variants } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { EASE } from './ease';

// Parent that reveals its <StaggerItem> children one after another.
const container: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};
const item: Variants = {
	hidden: { opacity: 0, y: 10 },
	show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

export function Stagger({
	as = 'div',
	className,
	children,
}: {
	as?: 'div' | 'ul' | 'ol';
	className?: string;
	children: ReactNode;
}) {
	const Tag = m[as];
	return (
		<Tag variants={container} initial="hidden" animate="show" className={className}>
			{children}
		</Tag>
	);
}

export function StaggerItem({
	as = 'div',
	className,
	children,
}: {
	as?: 'div' | 'li';
	className?: string;
	children: ReactNode;
}) {
	const Tag = m[as];
	return (
		<Tag variants={item} className={className}>
			{children}
		</Tag>
	);
}

// Fades and lifts its content in once, e.g. a result card.
export function Reveal({
	className,
	children,
	delay = 0,
}: {
	className?: string;
	children: ReactNode;
	delay?: number;
}) {
	return (
		<m.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: EASE, delay }}
			className={className}>
			{children}
		</m.div>
	);
}

// Counts a number up from zero (a score, a percentage).
export function CountUp({ to, className }: { to: number; className?: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const reduce = useReducedMotion();

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		if (reduce) {
			node.textContent = String(to);
			return;
		}
		const controls = animate(0, to, {
			duration: 0.9,
			ease: EASE,
			onUpdate: (value) => {
				node.textContent = String(Math.round(value));
			},
		});
		return () => controls.stop();
	}, [to, reduce]);

	// The moving digits are hidden from screen readers (a live region would
	// announce every step); they get the final value only.
	return (
		<>
			<span ref={ref} aria-hidden className={className}>
				{to}
			</span>
			<span className="sr-only">{to}</span>
		</>
	);
}
