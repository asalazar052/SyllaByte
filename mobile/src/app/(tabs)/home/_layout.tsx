import { Stack } from 'expo-router';

import { SyllaColors } from '@/constants/theme';
export const unstable_settings = { anchor: 'index' };
export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: SyllaColors.background },
			}}
		/>
	);
}
