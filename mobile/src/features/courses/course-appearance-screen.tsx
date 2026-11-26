import { useLocalSearchParams } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { goBackOr, PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { type CourseDetail, courseQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { updateCourseAppearance } from '@/domain/commands';

import { COURSE_COLOR_OPTIONS, COURSE_ICON_OPTIONS } from './course-appearance-options';
import { CourseIcon } from './course-icon';

const ICON_COLUMNS = 6;
const COLOR_COLUMNS = 4;

export function CourseAppearanceScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const courseId = Number.isInteger(Number(id)) ? Number(id) : 0;
	const { data: course, updatedAt } = useQuery(courseQuery(courseId), [courseId]);
	const back = () => goBackOr(`/courses/${courseId}`);
	return (
		<Screen>
			<PageHeader
				parent={course ? `COURSES / ${course.code}` : 'COURSES'}
				backLabel="Back to course"
				onBack={back}
				title="Icon and color."
				description="Choose how this course looks across the app."
			/>
			{updatedAt === undefined ? null : !course ? (
				<AppCard>
					<AppText variant="heading">Course not found</AppText>
					<AppText>This course is not part of your mock semester.</AppText>
				</AppCard>
			) : (
				<AppearanceForm course={course} />
			)}
		</Screen>
	);
}

// Each tap is saved straight away, and the course it reads back from drives the preview and the selection.
function AppearanceForm({ course }: { course: CourseDetail }) {
	const icon = course.icon;
	const background = course.iconBackground;

	// The color's darker partner becomes the course's color on the calendar.
	function chooseColor(value: string) {
		const option = COURSE_COLOR_OPTIONS.find((o) => o.value === value);
		updateCourseAppearance(course.id, {
			iconBackground: value,
			accentColor: option?.accent ?? course.accentColor,
		});
	}

	return (
		<>
			<View className="items-center py-2">
				<CourseIcon icon={icon} background={background} width={96} height={96} />
			</View>
			<View className="gap-3">
				<AppText variant="eyebrow" className="text-sylla-blue">
					ICON
				</AppText>
				<Grid
					columns={ICON_COLUMNS}
					items={COURSE_ICON_OPTIONS.map((option) => option.name)}
				>
					{(name) => {
						const label =
							COURSE_ICON_OPTIONS.find((o) => o.name === name)?.label ?? name;
						return (
							<Choice
								label={label}
								selected={name === icon}
								onPress={() => updateCourseAppearance(course.id, { icon: name })}
								fill={background}
							>
								<AppIcon name={name} size={24} tintColor={SyllaColors.navy} />
							</Choice>
						);
					}}
				</Grid>
			</View>
			<View className="gap-3">
				<AppText variant="eyebrow" className="text-sylla-blue">
					COLOR
				</AppText>
				<Grid columns={COLOR_COLUMNS} items={COURSE_COLOR_OPTIONS.map((o) => o.value)}>
					{(value) => {
						const label =
							COURSE_COLOR_OPTIONS.find((o) => o.value === value)?.label ?? value;
						return (
							<Choice
								label={label}
								selected={value === background}
								onPress={() => chooseColor(value)}
								fill={value}
							/>
						);
					}}
				</Grid>
			</View>
		</>
	);
}

// Lays items out in rows of `columns`, with empty cells filling the last row so every tile is the same size.
function Grid<T>({
	columns,
	items,
	children,
}: {
	columns: number;
	items: T[];
	children: (item: T) => ReactNode;
}) {
	const rows: T[][] = [];
	for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
	return (
		<View accessibilityRole="radiogroup" className="gap-2.5">
			{rows.map((row, index) => (
				<View key={index} className="flex-row gap-2.5">
					{Array.from({ length: columns }, (_, cell) => {
						const item = row[cell];
						return (
							<View key={cell} className="flex-1">
								{item === undefined ? null : children(item)}
							</View>
						);
					})}
				</View>
			))}
		</View>
	);
}

// One square tile in a grid. The chosen one gets a navy ring.
function Choice({
	label,
	selected,
	onPress,
	fill,
	children,
}: {
	label: string;
	selected: boolean;
	onPress: () => void;
	fill: string;
	children?: ReactNode;
}) {
	return (
		<Pressable
			accessibilityRole="radio"
			accessibilityLabel={label}
			accessibilityState={{ selected }}
			onPress={onPress}
			className={`aspect-square items-center justify-center rounded-small border-2 active:opacity-75 ${selected ? 'border-sylla-navy' : 'border-sylla-border'}`}
			style={{ backgroundColor: fill }}
		>
			{children}
		</Pressable>
	);
}
