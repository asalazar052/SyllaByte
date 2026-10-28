import { type ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SyllaColors } from '@/constants/theme';

export function Screen({ children }: { children: ReactNode }) {
	return (
		<SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
				{children}
			</ScrollView>
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: SyllaColors.background },
	content: {
		paddingTop: 12,
		paddingHorizontal: 24,
		paddingBottom: 32,
		gap: 22,
		width: '100%',
		maxWidth: 600,
		alignSelf: 'center',
		flexGrow: 1,
	},
});
