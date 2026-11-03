import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TurboModuleRegistry, View } from 'react-native';
import type { PdfRef } from 'react-native-pdf';

import { AppText } from '@/components/ui/app-text';
import { SyllaColors } from '@/constants/theme';

import type { PdfDocumentProps } from './pdf-document.types';

export function PdfDocument({
	uri,
	page,
	scale,
	onLoad,
	onPageChange,
	onScaleChange,
	onError,
}: PdfDocumentProps) {
	// Router evaluates route imports before opening this screen. Never load the PDF
	// package until native support is confirmed: older builds and Expo Go lack it.
	const [NativePdf] = useState(() => {
		if (!TurboModuleRegistry.get('ReactNativeBlobUtil')) return null;
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports -- An eager import crashes older native builds during route discovery.
			return require('react-native-pdf').default as typeof import('react-native-pdf').default;
		} catch {
			return null;
		}
	});
	const pdf = useRef<PdfRef>(null);
	const shownPage = useRef(1);
	useEffect(() => {
		if (NativePdf && page !== shownPage.current) {
			pdf.current?.setPage(page);
			shownPage.current = page;
		}
	}, [NativePdf, page]);
	if (!NativePdf)
		return (
			<View className="flex-1 justify-center gap-3 p-4">
				<AppText variant="heading">PDF viewer needs an app update</AppText>
				<AppText>
					This installed app doesn’t include the PDF viewer yet. Install a new development
					build to view this syllabus.
				</AppText>
			</View>
		);
	return (
		<NativePdf
			ref={pdf}
			source={{ uri, cache: false }}
			page={page}
			scale={scale}
			minScale={1}
			maxScale={3}
			fitPolicy={2}
			horizontal
			enablePaging
			spacing={0}
			onLoadComplete={(pages, _path, size) => onLoad(pages, size)}
			onPageChanged={(value) => {
				shownPage.current = value;
				onPageChange(value);
			}}
			onScaleChanged={onScaleChange}
			onError={onError}
			renderActivityIndicator={() => (
				<ActivityIndicator color={SyllaColors.blue} accessibilityLabel="Loading syllabus" />
			)}
			style={{ flex: 1, backgroundColor: SyllaColors.surface }}
		/>
	);
}
