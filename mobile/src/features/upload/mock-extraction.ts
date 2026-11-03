import { type CourseDraft, createSampleDraft } from './review-draft';

export const processingStages = [
	{
		phase: 'uploading',
		label: 'Uploading syllabus',
		detail: 'Preparing your PDF for processing.',
	},
	{
		phase: 'reading',
		label: 'Reading syllabus',
		detail: 'Finding the course information and dates.',
	},
	{
		phase: 'extracting',
		label: 'Extracting details',
		detail: 'Organizing your course, dates, and materials.',
	},
] as const;

export type ExtractionPhase = 'idle' | (typeof processingStages)[number]['phase'] | 'ready';

export type ExtractionResult = { draft: CourseDraft };

export type ExtractionState = {
	phase: ExtractionPhase;
	startedAt: number | null;
	result: ExtractionResult | null;
};

export const initialExtraction: ExtractionState = { phase: 'idle', startedAt: null, result: null };

type ExtractionAction =
	| { type: 'start' | 'advance'; now: number }
	| { type: 'reset' }
	| { type: 'edit'; draft: CourseDraft };

// Elapsed time lets the simulation catch up after the app has been backgrounded.
export function extractionReducer(
	state: ExtractionState,
	action: ExtractionAction,
): ExtractionState {
	if (action.type === 'reset') return initialExtraction;
	if (action.type === 'edit')
		return state.phase === 'ready' ? { ...state, result: { draft: action.draft } } : state;
	if (action.type === 'start') {
		if (state.phase !== 'idle') return state;
		return { phase: 'uploading', startedAt: action.now, result: null };
	}
	if (state.startedAt === null || state.phase === 'ready') return state;
	const elapsed = Math.max(0, action.now - state.startedAt);
	const phase =
		elapsed < 1500
			? 'uploading'
			: elapsed < 3500
				? 'reading'
				: elapsed < 6000
					? 'extracting'
					: 'ready';
	if (phase === state.phase) return state;
	return { ...state, phase, result: phase === 'ready' ? { draft: createSampleDraft() } : null };
}
