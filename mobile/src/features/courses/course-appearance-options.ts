import { type AppIconName } from '@/components/ui/app-icon';
import { SyllaColors } from '@/constants/theme';

// What a course's icon and its background can be changed to. The icons are drawn in navy, so the backgrounds are
// all light tints that keep them readable.
export const COURSE_ICON_OPTIONS: { name: AppIconName; label: string }[] = [
	{ name: 'courses', label: 'Books' },
	{ name: 'graduationCap', label: 'Graduation cap' },
	{ name: 'sigma', label: 'Sigma' },
	{ name: 'calculator', label: 'Calculator' },
	{ name: 'chartLine', label: 'Chart' },
	{ name: 'flask', label: 'Flask' },
	{ name: 'atom', label: 'Atom' },
	{ name: 'sprout', label: 'Sprout' },
	{ name: 'brain', label: 'Brain' },
	{ name: 'code', label: 'Code' },
	{ name: 'globe', label: 'Globe' },
	{ name: 'landmark', label: 'Landmark' },
	{ name: 'feather', label: 'Feather' },
	{ name: 'palette', label: 'Palette' },
	{ name: 'music', label: 'Music' },
	{ name: 'lightbulb', label: 'Lightbulb' },
	{ name: 'heartPulse', label: 'Heart' },
	{ name: 'compass', label: 'Compass' },
];

// Each background comes with a darker color of the same family, which becomes the course's color on the
// calendar. Only the background is shown in the picker.
export const COURSE_COLOR_OPTIONS: { value: string; accent: string; label: string }[] = [
	{ value: SyllaColors.paleBlue, accent: SyllaColors.blue, label: 'Blue' },
	{ value: SyllaColors.softBlue, accent: SyllaColors.navy, label: 'Steel blue' },
	{ value: SyllaColors.mint, accent: SyllaColors.teal, label: 'Mint' },
	{ value: SyllaColors.green, accent: SyllaColors.forest, label: 'Green' },
	{ value: SyllaColors.butter, accent: SyllaColors.ochre, label: 'Butter' },
	{ value: SyllaColors.peach, accent: SyllaColors.terracotta, label: 'Peach' },
	{ value: SyllaColors.blush, accent: SyllaColors.rose, label: 'Blush' },
	{ value: SyllaColors.purple, accent: SyllaColors.violet, label: 'Lavender' },
];
