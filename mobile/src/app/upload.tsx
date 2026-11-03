import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { ExtractionPreview } from '@/features/upload/extraction-preview';
import { useSyllabusPicker } from '@/features/upload/syllabus-picker';

export default function Upload() {
	const insets = useSafeAreaInsets();
	const { file, error, picking, pick, clear, processing, extraction, startExtraction, saving } =
		useSyllabusPicker();
	return (
		<Screen>
			<AppText variant="eyebrow" className="text-sylla-blue mt-3">
				SYLLABYTE / UPLOAD
			</AppText>
			<AppText variant="title" accessibilityRole="header">
				A clearer semester starts here.
			</AppText>
			<AppCard>
				<AppIcon name="scan" size={22} />
				<AppText variant="heading">
					{file && extraction.phase === 'idle'
						? 'Ready to extract'
						: file
							? 'PDF selected'
							: 'Upload a syllabus'}
				</AppText>
				<AppText className="text-sylla-muted">
					{file
						? 'Extract course information, important dates, and materials from your syllabus.'
						: 'Choose a PDF syllabus from your files to get started.'}
				</AppText>
				{file && (
					<View className="gap-2" accessibilityLiveRegion="polite">
						<AppText variant="label">{file.name}</AppText>
						<AppText variant="caption" className="text-sylla-muted">
							PDF{file.size !== undefined ? ` · ${formatFileSize(file.size)}` : ''}
						</AppText>
					</View>
				)}
				{file && extraction.phase === 'idle' && (
					<AppButton
						label="Extract course details"
						disabled={picking}
						onPress={startExtraction}
					/>
				)}
				{file ? (
					<View className="flex-row flex-wrap items-center gap-x-5">
						<Pressable
							accessibilityRole="button"
							disabled={picking || processing || saving}
							onPress={() => {
								void pick();
							}}
							className="min-h-11 justify-center"
						>
							<AppText variant="action" className="text-sylla-blue">
								{picking ? 'Opening files…' : 'Change PDF'}
							</AppText>
						</Pressable>
						<Pressable
							accessibilityRole="button"
							onPress={clear}
							disabled={picking || processing || saving}
							className="min-h-11 justify-center"
						>
							<AppText variant="action" className="text-sylla-muted">
								Remove PDF
							</AppText>
						</Pressable>
					</View>
				) : (
					<AppButton
						label={picking ? 'Opening files…' : 'Choose PDF'}
						disabled={picking || processing}
						onPress={() => {
							void pick();
						}}
					/>
				)}
				{error && extraction.phase !== 'ready' && (
					<AppText accessibilityRole="alert" className="text-sylla-brown">
						{error}
					</AppText>
				)}
				<AppText variant="caption" className="text-sylla-brown">
					Demo workflow · Uploading and extraction are simulated. Your PDF stays on your
					device and the results use sample data.
				</AppText>
			</AppCard>
			{file && <ExtractionPreview />}
			<Pressable
				accessibilityRole="button"
				className="min-h-11 items-center justify-center"
				onPress={() => {
					if (router.canGoBack()) router.back();
					else router.replace('/courses');
				}}
			>
				<AppText variant="action" className="text-sylla-muted">
					Back to courses
				</AppText>
			</Pressable>
			<View style={{ height: insets.bottom }} />
		</Screen>
	);
}

function formatFileSize(bytes: number) {
	return bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
