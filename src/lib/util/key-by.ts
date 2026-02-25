export default function keyBy<T, K extends keyof T>(arr: T[], key: K) {
	return arr.reduce(
		(result, item) => {
			result[item[key] as string] = item;
			return result;
		},
		{} as Record<string, T>
	);
}
