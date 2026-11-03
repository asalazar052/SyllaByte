import * as DocumentPicker from 'expo-document-picker';
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { Platform } from 'react-native';

import { saveReviewedCourse } from '@/db/save-course';

import { extractionReducer, type ExtractionState, initialExtraction } from './mock-extraction';
import { type CourseDraft, validateDraft } from './review-draft';
import { removeSyllabus, retainSyllabus } from './syllabus-storage';

type SyllabusPicker = {
	file: DocumentPicker.DocumentPickerAsset | null;
	error: string | null;
	picking: boolean;
	pick: () => Promise<boolean>;
	clear: () => void;
	extraction: ExtractionState;
	processing: boolean;
	startExtraction: () => void;
	cancelExtraction: () => void;
	updateDraft: (draft: CourseDraft) => void;
	save: (draft?: CourseDraft) => Promise<boolean>;
	saving: boolean;
	savedCourseId: number | null;
};

const SyllabusPickerContext = createContext<SyllabusPicker | null>(null);

// Keep the selected asset available when moving between Courses and the upload modal.
export function SyllabusPickerProvider({ children }: { children: ReactNode }) {
	const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
	const [selectedAt, setSelectedAt] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [picking, setPicking] = useState(false);
	const busy = useRef(false);
	const savingRef = useRef(false);
	const [saving, setSaving] = useState(false);
	const [savedCourseId, setSavedCourseId] = useState<number | null>(null);
	const [extraction, dispatch] = useReducer(extractionReducer, initialExtraction);
	const processing = extraction.phase !== 'idle' && extraction.phase !== 'ready';

	useEffect(() => {
		if (!processing) return;
		const timer = setInterval(() => dispatch({ type: 'advance', now: Date.now() }), 250);
		return () => clearInterval(timer);
	}, [processing]);

	async function pick() {
		if (busy.current || processing || savingRef.current) return false;
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
			setSelectedAt(Date.now());
			setSavedCourseId(null);
			dispatch({ type: 'reset' });
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
		if (processing || savingRef.current) return;
		setFile(null);
		setSelectedAt(null);
		setError(null);
		setSavedCourseId(null);
		dispatch({ type: 'reset' });
	}

	function startExtraction() {
		if (!file || busy.current) return;
		setError(null);
		dispatch({ type: 'start', now: Date.now() });
	}

	function cancelExtraction() {
		dispatch({ type: 'reset' });
	}

	function updateDraft(draft: CourseDraft) {
		if (savingRef.current || savedCourseId) return;
		setError(null);
		dispatch({ type: 'edit', draft });
	}

	async function save(reviewedDraft?: CourseDraft) {
		if (savingRef.current || savedCourseId || !file || !extraction.result) return false;
		const draft = reviewedDraft ?? extraction.result.draft;
		const validation = validateDraft(draft);
		if (validation) {
			setError(validation);
			return false;
		}
		savingRef.current = true;
		setSaving(true);
		setError(null);
		let path: string | null = null;
		try {
			const id = `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
			path = await retainSyllabus(file.uri, id);
			const courseId = saveReviewedCourse(draft, file.name, path, selectedAt);
			setSavedCourseId(courseId);
			return true;
		} catch (cause) {
			if (path) {
				try {
					removeSyllabus(path);
				} catch {
					/* Preserve the save error for retry. */
				}
			}
			setError(
				cause instanceof Error
					? cause.message
					: 'Could not save your course. Please try again.',
			);
			return false;
		} finally {
			savingRef.current = false;
			setSaving(false);
		}
	}

	return (
		<SyllabusPickerContext.Provider
			value={{
				file,
				error,
				picking,
				pick,
				clear,
				extraction,
				processing,
				startExtraction,
				cancelExtraction,
				updateDraft,
				save,
				saving,
				savedCourseId,
			}}
		>
			{children}
		</SyllabusPickerContext.Provider>
	);
}

export function useSyllabusPicker() {
	const picker = useContext(SyllabusPickerContext);
	if (!picker) throw new Error('SyllabusPickerProvider is required.');
	return picker;
}
