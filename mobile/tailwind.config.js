const { SyllaColors } = require('./src/constants/palette');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			// bg-sylla-surface, text-sylla-navy, border-sylla-border, ...
			colors: { sylla: SyllaColors },
			// Each Inter weight is its own font file (loaded in src/app/_layout.tsx), so a weight is a family here.
			fontFamily: {
				inter: ['Inter-Regular'],
				'inter-medium': ['Inter-Medium'],
				'inter-semibold': ['Inter-SemiBold'],
			},
			borderRadius: { small: '10px' },
		},
	},
	plugins: [],
};
