import * as DocumentPicker from 'expo-document-picker';
import { createContext, type ReactNode, useContext, useRef, useState } from 'react';
import { Platform } from 'react-native';

type SyllabusPicker = {
	file: DocumentPicker.DocumentPickerAsset | null;
	error: string | null;
	picking: boolean;
	pick: () => Promise<boolean>;
	clear: () => void;
};

const SyllabusPickerContext = createContext<SyllabusPicker | null>(null);

// Keep the selected asset available when moving between Courses and the upload modal.
export function SyllabusPickerProvider({ children }: { children: ReactNode }) {
	const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [picking, setPicking] = useState(false);
	const busy = useRef(false);

	async function pick() {
		if (busy.current) return false;
		// Some browsers never resolve the picker promise on cancel. Allow retrying there.
		busy.current = Platform.OS !== 'web';
		setPicking(busy.current);
		setError(null);
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: 'application/pdf',
				multiple: false,
				copyToCacheDirectory: true,
				base64: false,
			});
			if (result.canceled) return false;
			const selected = result.assets[0];
			if (
				!selected ||
				(selected.mimeType !== 'application/pdf' &&
					!selected.name.toLowerCase().endsWith('.pdf'))
			) {
				setError('Choose a PDF file for your syllabus.');
				return false;
			}
			if (selected.size === 0) {
				setError('This PDF is empty. Choose another file.');
				return false;
			}
			setFile(selected);
			return true;
		} catch {
			setError('We couldn’t open that file. Please try choosing the PDF again.');
			return false;
		} finally {
			busy.current = false;
			setPicking(false);
		}
	}

	function clear() {
		setFile(null);
		setError(null);
	}

	return (
		<SyllabusPickerContext.Provider value={{ file, error, picking, pick, clear }}>
			{children}
		</SyllabusPickerContext.Provider>
	);
}

export function useSyllabusPicker() {
	const picker = useContext(SyllabusPickerContext);
	if (!picker) throw new Error('SyllabusPickerProvider is required.');
	return picker;
}
