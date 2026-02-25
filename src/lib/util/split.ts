export default function split<T>(arr: T[], filter: (_: T) => boolean) {
	return arr.reduce<[T[], T[]]>(
		([matches, notMatches], item) => {
			if (filter(item)) {
				matches.push(item);
			} else {
				notMatches.push(item);
			}
			return [matches, notMatches];
		},
		[[], []]
	);
}
