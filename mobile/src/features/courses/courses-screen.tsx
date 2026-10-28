import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { currentSemesterQuery, filterCourses, semesterCoursesQuery } from '@/db/queries';

import { CourseCard } from './course-card';

export function CoursesScreen() {
	const { data: semester } = useLiveQuery(currentSemesterQuery());
	const { data: courses } = useLiveQuery(semesterCoursesQuery(semester?.id ?? 0), [semester?.id]);
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [reviewOnly, setReviewOnly] = useState(false);
	const input = useRef<ComponentRef<typeof TextInput>>(null);
	const visible = filterCourses(courses, query, reviewOnly);
	const reviewCourses = courses.filter((course) => course.reviewFields.length > 0);
	const reviewCount = reviewCourses.reduce(
		(count, course) => count + course.reviewFields.length,
		0,
	);
	const credits = courses.reduce((total, course) => total + (course.credits ?? 0), 0);
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
			<View className="gap-[15px]">
				<View className="min-h-[21px] flex-row items-center justify-between">
					<AppText variant="eyebrow" className="text-sylla-blue">
						{(semester?.name ?? '').toUpperCase()} / COURSES
					</AppText>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={searchOpen ? 'Close search' : 'Search courses'}
						aria-expanded={searchOpen}
						onPress={toggleSearch}
						hitSlop={12}
						className="h-[21px] w-6 items-center justify-center"
					>
						<AppIcon name="search" size={21} />
					</Pressable>
				</View>
				<AppText variant="title" accessibilityRole="header">
					Your semester, in focus.
				</AppText>
			</View>

			{searchOpen && (
				<View className="flex-row items-center rounded-small border border-sylla-border bg-sylla-surface">
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
						className="min-h-12 min-w-0 flex-1 p-3 font-inter text-[14px] text-sylla-navy"
					/>
					{query.length > 0 && (
						<Pressable
							accessibilityRole="button"
							onPress={() => {
								setQuery('');
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
			)}

			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`Review ${reviewCount} details in ${reviewCourses.length} courses`}
				aria-pressed={reviewOnly}
				onPress={() => setReviewOnly((value) => !value)}
				className="flex-row items-center gap-3 rounded-2xl bg-sylla-peach p-[15px] active:opacity-75"
			>
				<AppIcon name="scan" size={22} />
				<View className="flex-1 gap-[5px]">
					<AppText variant="label">{reviewCount} details could use your eyes</AppText>
					<AppText variant="caption" className="text-sylla-brown">
						Check highlighted fields in {reviewCourses.length} courses.
					</AppText>
				</View>
				<AppIcon name="arrow" size={18} />
			</Pressable>

			<View className="gap-3">
				<View className="flex-row flex-wrap items-center justify-between gap-2">
					<AppText variant="section" accessibilityRole="header">
						{semester?.name}
					</AppText>
					<AppText variant="action" className="text-sylla-blue">
						{courses.length} courses · {credits} credits
					</AppText>
				</View>
				{filtered && (
					<View className="flex-row items-center gap-2">
						<AppText
							variant="caption"
							className="flex-1 text-sylla-brown"
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
							className="min-h-11 justify-center px-2"
						>
							<AppText variant="action" className="text-sylla-blue">
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
						<AppText className="text-sylla-muted">
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
