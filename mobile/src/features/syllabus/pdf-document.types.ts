export type PdfDocumentProps = {
	uri: string;
	page: number;
	scale: number;
	onLoad: (pages: number, size: { width: number; height: number }) => void;
	onPageChange: (page: number) => void;
	onScaleChange: (scale: number) => void;
	onError: () => void;
};
