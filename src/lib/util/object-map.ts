export default function objectMap<T, U>(obj: Record<string, T>, map: (_: T) => U): Record<string, U> {
	return Object.fromEntries(Object.entries(obj).map(([key, _]) => [key, map(_)]));
}
