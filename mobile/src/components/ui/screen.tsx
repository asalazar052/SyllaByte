import { type ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: { children: ReactNode }) {
	return (
		<SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-sylla-background">
			<ScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerClassName="w-full max-w-xl grow gap-6 self-center px-6 pb-8 pt-3"
			>
				{children}
			</ScrollView>
		</SafeAreaView>
	);
}
