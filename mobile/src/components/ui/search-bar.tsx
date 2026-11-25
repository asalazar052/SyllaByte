import { type ComponentRef, useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { SyllaColors } from '@/constants/theme';
import type { useSearch } from '@/hooks/use-search';

import { AppText } from './app-text';

// The search box a screen shows while its search is open.
export function SearchBar({
	search,
	placeholder,
	label,
}: {
	search: ReturnType<typeof useSearch>;
	placeholder: string;
	label: string;
}) {
	const input = useRef<ComponentRef<typeof TextInput>>(null);
	if (!search.open) return null;
	return (
		<View className="flex-row items-center rounded-small border border-sylla-border bg-sylla-surface">
			<TextInput
				ref={input}
				autoFocus
				value={search.query}
				onChangeText={search.setQuery}
				placeholder={placeholder}
				placeholderTextColor={SyllaColors.muted}
				accessibilityLabel={label}
				autoCapitalize="none"
				autoCorrect={false}
				returnKeyType="search"
				className="min-h-12 min-w-0 flex-1 p-3 font-inter text-sm text-sylla-navy"
			/>
			{search.query.length > 0 && (
				<Pressable
					accessibilityRole="button"
					onPress={() => {
						search.setQuery('');
						input.current?.focus();
					}}
					className="min-h-11 justify-center px-2"
				>
					<AppText variant="action" className="text-sylla-blue">
						Clear
					</AppText>
				</Pressable>
			)}
		</View>
	);
}
