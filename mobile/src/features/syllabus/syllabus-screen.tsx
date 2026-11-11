import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/app-text';
import { PageHeader } from '@/components/ui/page-header';
import { SyllaColors } from '@/constants/theme';
import { courseQuery, type CourseSyllabus, courseSyllabusQuery } from '@/db/queries';
import { resolveSyllabus, shareSyllabus } from '@/features/upload/syllabus-storage';

import { PdfDocument } from './pdf-document';
import { ViewerControls } from './viewer-controls';

export function SyllabusScreen() {
	const { id: routeId } = useLocalSearchParams<{ id: string }>();
	const id = Number.isSafeInteger(Number(routeId)) && Number(routeId) > 0 ? Number(routeId) : 0;
	const { data: course, updatedAt } = useLiveQuery(courseQuery(id), [id]);
	const currentCourse = course?.id === id ? course : undefined;
	const { data: syllabus, updatedAt: syllabusUpdatedAt } = useLiveQuery(courseSyllabusQuery(id), [
		id,
	]);
	const currentSyllabus = syllabus?.courseId === id ? syllabus : undefined;
	return (
		<SyllabusViewer
			key={`${id}-${currentSyllabus?.storagePath ?? ''}`}
			id={id}
			course={currentCourse}
			syllabus={currentSyllabus}
			queried={
				updatedAt !== undefined &&
				syllabusUpdatedAt !== undefined &&
				(!course || course.id === id)
			}
		/>
	);
}

function SyllabusViewer({
	id,
	course,
	syllabus,
	queried,
}: {
	id: number;
	course: Awaited<ReturnType<typeof courseQuery>>;
	syllabus: CourseSyllabus | undefined;
	queried: boolean;
}) {
	const path = syllabus?.storagePath;
	const [source, setSource] = useState<{ uri: string } | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [retry, setRetry] = useState(0);
	const [pages, setPages] = useState(0);
	const [page, setPage] = useState(1);
	const [pageRequest, setPageRequest] = useState({ page: 1, sequence: 0 });
	const [scale, setScale] = useState(1);
	const [zoomRequest, setZoomRequest] = useState({ scale: 1, sequence: 0 });
	const [size, setSize] = useState<{ width: number; height: number } | null>(null);
	const [viewport, setViewport] = useState({ width: 0, height: 0 });
	const [sharing, setSharing] = useState(false);
	const [shareError, setShareError] = useState<string | null>(null);
	useEffect(() => {
		let active = true;
		if (Platform.OS === 'web' || !path) return;
		resolveSyllabus(path).then(
			(value) => {
				if (active) setSource(value);
			},
			(cause) => {
				if (active)
					setError(
						cause instanceof Error
							? cause.message
							: 'The saved syllabus could not be opened.',
					);
			},
		);
		return () => {
			active = false;
		};
	}, [path, retry]);

	function back() {
		router.dismissTo({ pathname: '/courses/[id]', params: { id } });
	}
	const unavailable = !queried
		? null
		: !course
			? 'This course could not be found.'
			: Platform.OS === 'web'
				? 'Open the mobile app to view your original syllabus. PDFs are retained on the device where you added the course.'
				: !path
					? 'No original PDF is saved for this course.'
					: error;
	const ratio = size && size.width > 0 && size.height > 0 ? size.width / size.height : null;
	const width =
		ratio && viewport.height
			? Math.min(viewport.width, viewport.height * ratio)
			: viewport.width;
	const height = ratio && width ? width / ratio : viewport.height;

	return (
		<SafeAreaView
			edges={['top', 'left', 'right']}
			className="min-h-0 flex-1 bg-sylla-background"
		>
			<View className="min-h-0 w-full max-w-xl flex-1 gap-5 self-center px-6 pb-5 pt-3">
				<PageHeader
					parent={`${course?.code ?? 'COURSE'} / SYLLABUS`}
					backLabel="Back to course"
					onBack={back}
					title="Syllabus"
				/>
				{syllabus && (
					<View className="flex-row items-center gap-3">
						<View className="h-11 w-10 items-center justify-center rounded-small bg-sylla-paleBlue">
							<AppIcon name="document" />
						</View>
						<View className="min-w-0 flex-1 gap-1">
							<AppText variant="label" numberOfLines={2}>
								{syllabus.filename}
							</AppText>
							<AppText variant="caption" className="text-sylla-muted">
								{pages ? `${pages} ${pages === 1 ? 'page' : 'pages'}` : 'PDF'}
								{syllabus.uploadedAt != null
									? ` · Uploaded ${new Date(syllabus.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
									: ''}
							</AppText>
						</View>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Share original PDF"
							accessibilityState={{ disabled: !source || sharing }}
							disabled={!source || sharing}
							onPress={async () => {
								if (!path) return;
								setSharing(true);
								setShareError(null);
								try {
									await shareSyllabus(path, syllabus?.filename);
								} catch (cause) {
									setShareError(
										cause instanceof Error
											? cause.message
											: 'Could not share the PDF. Try again.',
									);
								} finally {
									setSharing(false);
								}
							}}
							className="h-11 w-11 items-center justify-center rounded-small border border-sylla-border bg-sylla-surface"
							style={!source || sharing ? { opacity: 0.4 } : undefined}
						>
							<AppIcon name="share" size={18} />
						</Pressable>
					</View>
				)}
				{shareError && (
					<AppText variant="caption" accessibilityRole="alert" className="text-red-700">
						{shareError}
					</AppText>
				)}
				<View
					className="min-h-0 flex-1 items-center justify-center"
					onLayout={(event) => setViewport(event.nativeEvent.layout)}
				>
					{unavailable ? (
						<View className="w-full gap-4 rounded-2xl border border-sylla-border bg-sylla-surface p-4">
							<AppText accessibilityRole="alert">{unavailable}</AppText>
							{error && path && (
								<AppButton
									label="Try again"
									onPress={() => {
										setError(null);
										setSource(null);
										setPages(0);
										setPage(1);
										setPageRequest({ page: 1, sequence: 0 });
										setScale(1);
										setZoomRequest({ scale: 1, sequence: 0 });
										setSize(null);
										setRetry((value) => value + 1);
									}}
								/>
							)}
						</View>
					) : source && viewport.width > 0 && viewport.height > 0 ? (
						<View
							className="overflow-hidden rounded-sm border border-sylla-border bg-sylla-surface"
							style={{
								width,
								height,
								boxShadow: '0px 3px 10px rgba(24, 47, 71, 0.08)',
							}}
						>
							<PdfDocument
								key={`${path}-${retry}`}
								uri={source.uri}
								pageRequest={pageRequest}
								zoomRequest={zoomRequest}
								onLoad={(count, dimensions) => {
									if (count < 1) {
										setError('This PDF has no readable pages.');
										return;
									}
									setPages(count);
									setSize(dimensions);
								}}
								onPageChange={setPage}
								onScaleChange={(value) => {
									if (Number.isFinite(value))
										setScale(Math.min(3, Math.max(1, value)));
								}}
								onError={() =>
									setError(
										'This PDF couldn’t be opened. It may be damaged or password-protected.',
									)
								}
							/>
						</View>
					) : (
						<ActivityIndicator
							color={SyllaColors.blue}
							accessibilityLabel="Loading syllabus"
						/>
					)}
				</View>
				{pages > 0 && !unavailable && (
					<ViewerControls
						page={page}
						pages={pages}
						scale={scale}
						onPage={(value) => {
							const next = Math.max(1, Math.min(pages, value));
							setPage(next);
							setPageRequest((previous) => ({
								page: next,
								sequence: previous.sequence + 1,
							}));
						}}
						onScale={(value) => {
							setScale(value);
							setZoomRequest((previous) => ({
								scale: value,
								sequence: previous.sequence + 1,
							}));
						}}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}
