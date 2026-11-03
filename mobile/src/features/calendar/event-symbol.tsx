import { View, type ViewStyle } from 'react-native';

export type SymbolShape = 'circle' | 'square' | 'triangle' | 'diamond';

function shapeStyle(shape: SymbolShape, size: number, color: string): ViewStyle {
	switch (shape) {
		case 'circle':
			return { width: size, height: size, borderRadius: size / 2, backgroundColor: color };
		case 'square':
			return { width: size - 1, height: size - 1, borderRadius: 1, backgroundColor: color };
		case 'diamond':
			return {
				width: size * 0.72,
				height: size * 0.72,
				backgroundColor: color,
				transform: [{ rotate: '45deg' }],
			};
		case 'triangle':
			return {
				width: 0,
				height: 0,
				borderLeftWidth: size / 2,
				borderRightWidth: size / 2,
				borderBottomWidth: size,
				borderLeftColor: 'transparent',
				borderRightColor: 'transparent',
				borderBottomColor: color,
			};
	}
}

// A small filled shape that marks an event category.
export function EventSymbol({
	shape,
	color,
	size = 8,
}: {
	shape: SymbolShape;
	color: string;
	size?: number;
}) {
	return (
		<View className="items-center justify-center" style={{ width: size, height: size }}>
			<View style={shapeStyle(shape, size, color)} />
		</View>
	);
}
