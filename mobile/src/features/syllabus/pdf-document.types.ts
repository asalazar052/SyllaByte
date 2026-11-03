export type PdfDocumentProps = {
	uri: string;
	pageRequest: { page: number; sequence: number };
	zoomRequest: { scale: number; sequence: number };
	onLoad: (pages: number, size: { width: number; height: number }) => void;
	onPageChange: (page: number) => void;
	onScaleChange: (scale: number) => void;
	onError: () => void;
};
