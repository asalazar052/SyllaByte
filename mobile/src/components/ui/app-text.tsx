import { StyleSheet, Text, type TextProps } from 'react-native';

import { SyllaColors, SyllaFonts } from '@/constants/theme';

type Props = TextProps & { variant?: keyof typeof styles; color?: string };

export function AppText({ variant = 'body', color = SyllaColors.navy, style, ...props }: Props) {
	return <Text {...props} style={[styles.base, styles[variant], { color }, style]} />;
}

const styles = StyleSheet.create({
	base: { fontFamily: SyllaFonts.regular, color: SyllaColors.navy },
	body: { fontSize: 14, lineHeight: 21 },
	title: { fontSize: 30, lineHeight: 36 },
	section: { fontSize: 17, lineHeight: 22 },
	heading: { fontFamily: SyllaFonts.semibold, fontSize: 16, lineHeight: 20 },
	label: { fontFamily: SyllaFonts.semibold, fontSize: 13, lineHeight: 16 },
	action: { fontFamily: SyllaFonts.semibold, fontSize: 12, lineHeight: 16 },
	caption: { fontSize: 11, lineHeight: 14 },
	eyebrow: { fontFamily: SyllaFonts.semibold, fontSize: 11, lineHeight: 14 },
	code: { fontFamily: SyllaFonts.semibold, fontSize: 10, lineHeight: 12 },
	micro: { fontSize: 10, lineHeight: 12 },
});
