import { type ComponentRef, type ReactNode, type Ref } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// `scrollRef` lets a screen scroll itself, for example back to the top after an action lower down.
export function Screen({
	children,
	scrollRef,
}: {
	children: ReactNode;
	scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
}) {
	return (
		<SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-sylla-background">
			<ScrollView
				ref={scrollRef}
				keyboardShouldPersistTaps="handled"
				contentContainerClassName="w-full max-w-xl grow gap-6 self-center px-6 pb-8 pt-3"
			>
				{children}
			</ScrollView>
		</SafeAreaView>
	);
}
