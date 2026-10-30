import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import type { Course } from '@/db/queries';

// Courses shown before "More" reveals the rest.
const COLLAPSED_COUNT = 2;

function Chip({
	label,
	selected = false,
	onPress,
}: {
	label: string;
	selected?: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			aria-pressed={selected}
			onPress={onPress}
			hitSlop={6}
			className={`rounded-full border px-3 py-2 active:opacity-75 ${selected ? 'border-sylla-navy bg-sylla-navy' : 'border-sylla-border'}`}
		>
			<AppText
				variant={selected ? 'action' : 'caption'}
				className={selected ? 'text-white' : undefined}
			>
				{label}
			</AppText>
		</Pressable>
	);
}

// Narrows the calendar to one course; null is every course.
export function CourseFilter({
	courses,
	selectedId,
	onSelect,
}: {
	courses: Course[];
	selectedId: number | null;
	onSelect: (courseId: number | null) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	// The selected course stays visible even when it is one of the hidden ones, as when an exam card picks it.
	const shown = expanded
		? courses
		: courses.filter((course, index) => index < COLLAPSED_COUNT || course.id === selectedId);
	return (
		<View className="flex-row flex-wrap gap-2">
			<Chip
				label="All courses"
				selected={selectedId === null}
				onPress={() => onSelect(null)}
			/>
			{shown.map((course) => (
				<Chip
					key={course.id}
					label={course.code}
					selected={selectedId === course.id}
					onPress={() => onSelect(course.id)}
				/>
			))}
			{shown.length < courses.length && (
				<Chip label="More" onPress={() => setExpanded(true)} />
			)}
		</View>
	);
}
