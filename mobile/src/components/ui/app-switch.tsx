import { Pressable, View } from 'react-native';

export function AppSwitch({
	value,
	onValueChange,
	label,
}: {
	value: boolean;
	onValueChange: (value: boolean) => void;
	label: string;
}) {
	return (
		<Pressable
			accessibilityRole="switch"
			accessibilityLabel={label}
			aria-checked={value}
			onPress={() => onValueChange(!value)}
			hitSlop={8}
		>
			<View
				className={`h-6 w-9 rounded-full p-1 transition-colors duration-200 ${value ? 'bg-sylla-blue' : 'bg-sylla-muted'}`}
			>
				{/* The knob slides the track's width (w-9) less its own width (w-4) and the track's padding (p-1 on each side): 12px. */}
				<View
					className={`h-4 w-4 rounded-full bg-sylla-white transition-transform duration-200 ${value ? 'translate-x-3' : 'translate-x-0'}`}
				/>
			</View>
		</Pressable>
	);
}
