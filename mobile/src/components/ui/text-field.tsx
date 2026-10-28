import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { Radii, SyllaColors, SyllaFonts } from '@/constants/theme';

import { AppText } from './app-text';

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
	return (
		<View style={styles.field}>
			<AppText variant="caption" color={SyllaColors.muted}>
				{label}
			</AppText>
			<TextInput
				accessibilityLabel={label}
				autoCorrect={false}
				{...props}
				style={[styles.input, props.style]}
			/>
		</View>
	);
}
const styles = StyleSheet.create({
	field: { gap: 4 },
	input: {
		minHeight: 44,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: SyllaColors.border,
		borderRadius: Radii.small,
		backgroundColor: SyllaColors.background,
		fontFamily: SyllaFonts.regular,
		fontSize: 14,
		color: SyllaColors.navy,
	},
});
