import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { type ComponentRef, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SyllaColors } from '@/constants/theme';
import { currentSemesterQuery, savedMaterialsQuery } from '@/db/queries';

import { MaterialList } from './material-list';

export function MaterialsScreen() {
	const { data: semester } = useLiveQuery(currentSemesterQuery());
	const { data: saved } = useLiveQuery(savedMaterialsQuery());
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState('');
	const input = useRef<ComponentRef<typeof TextInput>>(null);

	const materials = saved.filter(({ course }) => course.semesterId === semester?.id);
	const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
	const visible = materials.filter(({ item, course }) =>
		`${course.code} ${course.title} ${item.title} ${item.details ?? ''}`
			.toLowerCase()
			.includes(normalized),
	);
	const courseCount = new Set(materials.map(({ course }) => course.id)).size;

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
			<View className="gap-4">
				<View className="min-h-5 flex-row items-center justify-between">
					<AppText variant="eyebrow" className="text-sylla-blue">
						{(semester?.name ?? '').toUpperCase()} / MATERIALS
					</AppText>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={searchOpen ? 'Close search' : 'Search materials'}
						aria-expanded={searchOpen}
						onPress={toggleSearch}
						hitSlop={12}
						className="h-5 w-6 items-center justify-center"
					>
						<AppIcon name="search" size={21} />
					</Pressable>
				</View>
				<AppText variant="title" accessibilityRole="header">
					Your reading, gathered.
				</AppText>
			</View>

			{searchOpen && (
				<View className="flex-row items-center rounded-small border border-sylla-border bg-sylla-surface">
					<TextInput
						ref={input}
						autoFocus
						value={query}
						onChangeText={setQuery}
						placeholder="Search by title or course"
						placeholderTextColor={SyllaColors.muted}
						accessibilityLabel="Search materials by title or course"
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="search"
						className="min-h-12 min-w-0 flex-1 p-3 font-inter text-sm text-sylla-navy"
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

			<View className="flex-row items-center gap-3 rounded-2xl bg-[#E9EFF4] p-[15px]">
				<AppIcon name="materials" size={24} />
				<View className="min-w-0 flex-1 gap-1">
					<AppText className="font-inter-semibold text-[13px]">
						Found in your syllabi
					</AppText>
					<AppText className="text-[11px] text-sylla-blue">
						{materials.length} {materials.length === 1 ? 'material' : 'materials'} ·{' '}
						{courseCount} {courseCount === 1 ? 'course' : 'courses'}
					</AppText>
				</View>
			</View>

			<View className="gap-2.5">
				<View className="flex-row items-center justify-between gap-2">
					<AppText variant="section" accessibilityRole="header">
						On your bookshelf
					</AppText>
					<AppText variant="action" className="text-sylla-blue">
						{visible.length} {visible.length === 1 ? 'book' : 'books'}
					</AppText>
				</View>
				<MaterialList
					materials={visible}
					linkToCourse
					emptyTitle={materials.length ? 'No materials found' : 'No saved materials yet'}
					emptyMessage={
						materials.length
							? 'Try another title or course, or clear your search.'
							: 'Review and add a syllabus to see them here.'
					}
				/>
			</View>

			<AppText className="text-[10px] leading-[15px] text-sylla-muted">
				Always confirm editions before buying.
			</AppText>
		</Screen>
	);
}
