import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radii, SyllaColors } from '@/constants/theme';

export function AppCard({ style, ...props }: ViewProps) {
	return <View {...props} style={[styles.card, style]} />;
}
export const cardStyle = {
	backgroundColor: SyllaColors.surface,
	borderColor: SyllaColors.border,
	borderWidth: 1,
	borderRadius: Radii.card,
};
const styles = StyleSheet.create({ card: { ...cardStyle, padding: 16, gap: 12 } });
