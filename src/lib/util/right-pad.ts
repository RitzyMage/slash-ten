export default function rightPad (val: string, length: number) {
	val = String(val || '');
	if (val.length > length) {
		return val.substring(0, length);
	}
	const missingLength = length - val.length;
	const spaces = Array(missingLength).fill(' ').join('');
	return val + spaces;
};