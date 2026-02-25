export default function groupBy<T, K extends keyof T>(arr: T[], key: K) {
	return arr.reduce(
		(result, item) => {
			let value = item[key] as string;
			if (!result[value]) {
				result[value] = [];
			}
			result[value].push(item);
			return result;
		},
		{} as Record<string, T[]>
	);
}
