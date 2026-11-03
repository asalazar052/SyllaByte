// Mixes a '#RRGGBB' color toward white: 0 returns the color, 1 returns white. Anything that isn't
// a six-digit hex color comes back unchanged.
export function lighten(hex: string, amount: number) {
	if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
	const channels = [1, 3, 5].map((start) => {
		const value = parseInt(hex.slice(start, start + 2), 16);
		return Math.round(value + (255 - value) * amount)
			.toString(16)
			.padStart(2, '0');
	});
	return `#${channels.join('')}`;
}
