import { AppText } from '@/components/ui/app-text';

import type { PdfDocumentProps } from './pdf-document.types';

// Native PDF code stays out of web/server bundles.
export function PdfDocument(_props: PdfDocumentProps) {
	return <AppText>Open the mobile app to view your original syllabus.</AppText>;
}
