const leftPad = (val: string, length: number, char = ' ') => {
	val = String(val || '');
	if (val.length > length) {
		return val.substring(0, length);
	}
	const missingLength = length - val.length;
	const spaces = Array(missingLength).fill(char).join('');
	return spaces + val;
};

export default leftPad;
