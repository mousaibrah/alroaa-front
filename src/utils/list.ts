// Returns the list with the item at `index` moved by `delta` positions.
export function moveItem<T>(items: T[], index: number, delta: -1 | 1): T[] {
	const target = index + delta;
	if (target < 0 || target >= items.length) return items;
	const copy = [...items];
	[copy[index], copy[target]] = [copy[target], copy[index]];
	return copy;
}
