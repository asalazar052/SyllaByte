import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { cardClassName } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { processingStages, useSyllabusPicker } from '@/features/upload';

// Where a syllabus that is being read, or is waiting for review, stands. It shows nothing when there is no
// upload under way, and goes once the course has been saved.
export function SyllabusProgressCard() {
	const { file, extraction, savedCourseId } = useSyllabusPicker();
	if (extraction.phase === 'idle' || !file || savedCourseId) return null;
	const ready = extraction.phase === 'ready';
	const step = processingStages.findIndex((stage) => stage.phase === extraction.phase);
	const stage = processingStages[step];
	// The extraction reports which stage it is in, not how far through it is, so the bar moves in stages.
	const progress = ready ? 1 : (step + 1) / (processingStages.length + 1);
	const title = ready ? 'Your syllabus is ready to review' : stage.label;
	const detail = ready
		? file.name
		: `${file.name} · Step ${step + 1} of ${processingStages.length}`;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${title}. ${detail}`}
			accessibilityHint={ready ? 'Opens the extracted details' : 'Shows the progress'}
			onPress={() => router.push('/upload')}
			className={`${cardClassName} gap-3.5 p-4 active:opacity-75`}
		>
			<View className="flex-row items-center gap-3">
				<View className="size-[38px] items-center justify-center rounded-small bg-sylla-paleBlue/60">
					<AppIcon name="scan" size={20} />
				</View>
				<View className="min-w-0 flex-1 gap-1">
					<AppText className="font-inter-semibold text-[13px]" numberOfLines={1}>
						{title}
					</AppText>
					<AppText className="text-[11px] text-sylla-muted" numberOfLines={1}>
						{detail}
					</AppText>
				</View>
			</View>
			<View
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
				className="h-[5px] overflow-hidden rounded-full bg-sylla-paleBlue/60"
			>
				<View
					className="h-[5px] rounded-full bg-sylla-blue"
					style={{ width: `${progress * 100}%` }}
				/>
			</View>
			<AppText variant="action" className="text-sylla-blue">
				{ready ? 'Review details →' : 'View progress →'}
			</AppText>
		</Pressable>
	);
}
