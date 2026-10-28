// Plain CommonJS so tailwind.config.js (which runs in Node, outside Metro) can require it.
// theme.ts re-exports these for the places a className can't reach: the navigation theme,
// Stack options, icon tints, placeholder colors, and the colors stored in the database.

// Figma foundations shared by the first SyllaByte screens.
const SyllaColors = {
	background: '#F7F5F0',
	surface: '#FFFEFB',
	navy: '#203B57',
	blue: '#315F85',
	muted: '#75808A',
	border: '#E3E4DE',
	paleBlue: '#dbe6f0',
	green: '#DCECCF',
	purple: '#E9E6F1',
	peach: '#F6E7D6',
	brown: '#91623B',
	white: '#FFFFFF',
	softBlue: '#B6C9D9',
	forest: '#406B4C',
	violet: '#6F5A8F',
	terracotta: '#B0603A',
};

module.exports = { SyllaColors };
