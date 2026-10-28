import { router } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { Radii, SyllaColors, SyllaFonts } from '@/constants/theme';
import { courses, filterCourses, semester } from '@/data/courses';

import { CourseCard } from './course-card';

export function CoursesScreen() {
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [reviewOnly, setReviewOnly] = useState(false);
	const input = useRef<ComponentRef<typeof TextInput>>(null);
	const visible = filterCourses(query, reviewOnly);
	const reviewCourses = courses.filter((course) => course.reviewFields.length > 0);
	const reviewCount = reviewCourses.reduce(
		(count, course) => count + course.reviewFields.length,
		0,
	);
	const credits = courses.reduce((total, course) => total + course.credits, 0);
	const filtered = reviewOnly || query.trim().length > 0;

	function toggleSearch() {
		if (searchOpen) {
			setQuery('');
			setSearchOpen(false);
		} else {
			setSearchOpen(true);
		}
	}

	return (
		<Screen>
			<View style={styles.heading}>
				<View style={styles.context}>
					<AppText variant="eyebrow" color={SyllaColors.blue}>
						{semester.name.toUpperCase()} / COURSES
					</AppText>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={searchOpen ? 'Close search' : 'Search courses'}
						aria-expanded={searchOpen}
						onPress={toggleSearch}
						hitSlop={12}
						style={styles.searchButton}
					>
						<AppIcon name="search" size={21} />
					</Pressable>
				</View>
				<AppText variant="title" accessibilityRole="header">
					Your semester, in focus.
				</AppText>
			</View>

			{searchOpen && (
				<View style={styles.searchRow}>
					<TextInput
						ref={input}
						autoFocus
						value={query}
						onChangeText={setQuery}
						placeholder="Search by course or title"
						placeholderTextColor={SyllaColors.muted}
						accessibilityLabel="Search by course code or title"
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="search"
						style={styles.input}
					/>
					{query.length > 0 && (
						<Pressable
							accessibilityRole="button"
							onPress={() => {
								setQuery('');
								input.current?.focus();
							}}
							style={styles.clear}
						>
							<AppText variant="action" color={SyllaColors.blue}>
								Clear
							</AppText>
						</Pressable>
					)}
				</View>
			)}

			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`Review ${reviewCount} details in ${reviewCourses.length} courses`}
				aria-pressed={reviewOnly}
				onPress={() => setReviewOnly((value) => !value)}
				style={({ pressed }) => [styles.notice, pressed && styles.pressed]}
			>
				<AppIcon name="scan" size={22} />
				<View style={styles.noticeCopy}>
					<AppText variant="label">{reviewCount} details could use your eyes</AppText>
					<AppText variant="caption" color={SyllaColors.brown}>
						Check highlighted fields in {reviewCourses.length} courses.
					</AppText>
				</View>
				<AppIcon name="arrow" size={18} />
			</Pressable>

			<View style={styles.list}>
				<View style={styles.section}>
					<AppText variant="section" accessibilityRole="header">
						{semester.name}
					</AppText>
					<AppText variant="action" color={SyllaColors.blue}>
						{courses.length} courses · {credits} credits
					</AppText>
				</View>
				{filtered && (
					<View style={styles.filterRow}>
						<AppText
							variant="caption"
							color={SyllaColors.brown}
							style={styles.flex}
							accessibilityLiveRegion="polite"
						>
							{reviewOnly ? 'Needs review · ' : ''}
							{visible.length} {visible.length === 1 ? 'course' : 'courses'} shown
						</AppText>
						<Pressable
							accessibilityRole="button"
							onPress={() => {
								setReviewOnly(false);
								setQuery('');
							}}
							style={styles.clear}
						>
							<AppText variant="action" color={SyllaColors.blue}>
								Show all courses
							</AppText>
						</Pressable>
					</View>
				)}
				{visible.map((course) => (
					<CourseCard key={course.id} course={course} />
				))}
				{visible.length === 0 && (
					<AppCard>
						<AppText variant="heading">No courses found</AppText>
						<AppText color={SyllaColors.muted}>
							Try another course code or title, or clear your filters.
						</AppText>
					</AppCard>
				)}
			</View>
			<AppButton
				label="Upload a syllabus"
				icon="plus"
				onPress={() => router.push('/upload')}
			/>
		</Screen>
	);
}
const styles = StyleSheet.create({
	heading: { gap: 15 },
	context: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		minHeight: 21,
	},
	searchButton: { width: 24, height: 21, alignItems: 'center', justifyContent: 'center' },
	notice: {
		backgroundColor: SyllaColors.peach,
		borderRadius: Radii.card,
		padding: 15,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	noticeCopy: { flex: 1, gap: 5 },
	list: { gap: 12 },
	section: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		gap: 8,
	},
	searchRow: {
		backgroundColor: SyllaColors.surface,
		borderColor: SyllaColors.border,
		borderWidth: 1,
		borderRadius: Radii.small,
		flexDirection: 'row',
		alignItems: 'center',
	},
	input: {
		flex: 1,
		minWidth: 0,
		minHeight: 48,
		padding: 12,
		fontFamily: SyllaFonts.regular,
		fontSize: 14,
		color: SyllaColors.navy,
	},
	clear: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
	filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	flex: { flex: 1 },
	pressed: { opacity: 0.75 },
});
