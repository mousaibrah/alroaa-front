// Heading band at the top of the inner pages: light green, with the title on
// one side and a photo card on the other (hidden on small screens).
export default function HeroSmall({
	title,
	sub,
	img = 'about',
}: {
	title: string;
	sub: string;
	img?: string;
}) {
	return (
		<section className="bg-sand pt-32 pb-14">
			<div className="reveal mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1.2fr_1fr]">
				<div>
					<span className="mb-4 block h-1 w-14 rounded-full bg-brand-secondary" />
					<h1 className="mb-4 text-4xl font-extrabold text-primary-dark md:text-5xl">{title}</h1>
					<p className="max-w-2xl text-lg leading-8 text-muted-foreground">{sub}</p>
				</div>
				<img
					src={`/assets/img/${img}.webp`}
					alt=""
					className="hidden aspect-[16/9] w-full rounded-2xl object-cover shadow-lg lg:block"
				/>
			</div>
		</section>
	);
}
