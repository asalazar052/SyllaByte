import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { TabHeader } from '@/components/ui/tab-header';
import { useCurrentSemester } from '@/db/hooks';
import { savedMaterialsQuery } from '@/db/queries';
import { useQuery } from '@/db/use-query';
import { useSearch } from '@/hooks/use-search';
import { normalizeSearch } from '@/lib/input';
import { plural } from '@/lib/plural';

import { MaterialList } from './material-list';

export function MaterialsScreen() {
	const semester = useCurrentSemester();
	const { data: materials } = useQuery(savedMaterialsQuery(undefined, semester?.id ?? 0), [
		semester?.id,
	]);
	const search = useSearch();

	const normalized = normalizeSearch(search.query);
	const visible = materials.filter(({ item, course }) =>
		`${course.code} ${course.title} ${item.title} ${item.details ?? ''}`
			.toLowerCase()
			.includes(normalized),
	);
	const courseCount = new Set(materials.map(({ course }) => course.id)).size;

	return (
		<Screen>
			<TabHeader
				eyebrow={`${(semester?.name ?? '').toUpperCase()} / MATERIALS`}
				title="Your reading, gathered."
				action={{
					icon: 'search',
					label: search.open ? 'Close search' : 'Search materials',
					expanded: search.open,
					onPress: search.toggle,
				}}
			/>

			<SearchBar
				search={search}
				placeholder="Search by title or course"
				label="Search materials by title or course"
			/>

			<View className="flex-row items-center gap-3 rounded-2xl bg-[#E9EFF4] p-[15px]">
				<AppIcon name="materials" size={24} />
				<View className="min-w-0 flex-1 gap-1">
					<AppText className="font-inter-semibold text-[13px]">
						Found in your syllabi
					</AppText>
					<AppText className="text-[11px] text-sylla-blue">
						{plural(materials.length, 'material')} · {plural(courseCount, 'course')}
					</AppText>
				</View>
			</View>

			<View className="gap-2.5">
				<View className="flex-row items-center justify-between gap-2">
					<AppText variant="section" accessibilityRole="header">
						On your bookshelf
					</AppText>
					<AppText variant="action" className="text-sylla-blue">
						{plural(visible.length, 'book')}
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
