import { Pressable, View } from 'react-native';

import { type DayCode, DAYS, formatDays, parseDays } from '@/lib/format';

import { AppText } from './app-text';

// Toggle chips for all seven days; value is the stored code string, e.g. 'MWF'.
export function DaysField({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	const selected = new Set(parseDays(value));
	function toggle(code: DayCode) {
		if (selected.has(code)) selected.delete(code);
		else selected.add(code);
		onChange(formatDays(selected));
	}
	return (
		<View className="gap-1">
			<AppText variant="caption" className="text-sylla-muted">
				{label}
			</AppText>
			<View className="flex-row gap-1.5">
				{DAYS.map(({ code, name }) => {
					const on = selected.has(code);
					return (
						<Pressable
							key={code}
							accessibilityRole="checkbox"
							accessibilityLabel={name}
							accessibilityState={{ checked: on }}
							onPress={() => toggle(code)}
							className={`min-h-11 flex-1 items-center justify-center rounded-small border ${
								on
									? 'border-sylla-navy bg-sylla-navy'
									: 'border-sylla-border bg-sylla-background'
							}`}
						>
							<AppText variant="action" className={on ? 'text-white' : undefined}>
								{code}
							</AppText>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
