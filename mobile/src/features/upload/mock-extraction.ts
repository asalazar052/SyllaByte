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

export type ExtractionField = { label: string; value: string; needsReview?: boolean };
export type ExtractionResult = { sections: { title: string; fields: ExtractionField[] }[] };

// Deliberately independent of the chosen PDF: this is a workflow preview only.
const sampleResult: ExtractionResult = {
	sections: [
		{
			title: 'Course information',
			fields: [
				{ label: 'Course code', value: 'CS 240' },
				{ label: 'Course title', value: 'Data Structures' },
				{ label: 'Semester', value: 'Fall 2026' },
				{ label: 'Credits', value: '3' },
				{ label: 'Professor', value: 'Dr. Alex Morgan' },
				{ label: 'Email', value: 'amorgan@example.edu' },
				{ label: 'Class schedule', value: 'MWF · 10:00–10:50 AM' },
				{ label: 'Location', value: 'Technology Hall 208' },
				{ label: 'Office hours', value: 'TTh · 2:00–3:00 PM · Technology Hall 214' },
			],
		},
		{
			title: 'Important dates',
			fields: [
				{ label: 'Project 1', value: 'September 18, 2026 · 11:59 PM' },
				{ label: 'Midterm exam', value: 'October 16, 2026 · 10:00 AM' },
				{
					label: 'Final exam',
					value: 'December 14, 2026 · Time unclear',
					needsReview: true,
				},
			],
		},
		{
			title: 'Materials',
			fields: [
				{
					label: 'Textbook',
					value: 'Data Structures and Algorithms · Edition unclear',
					needsReview: true,
				},
				{ label: 'Online resources', value: 'Course learning portal' },
			],
		},
	],
};

export type ExtractionState = {
	phase: ExtractionPhase;
	startedAt: number | null;
	result: ExtractionResult | null;
};

export const initialExtraction: ExtractionState = { phase: 'idle', startedAt: null, result: null };

type ExtractionAction = { type: 'start' | 'advance'; now: number } | { type: 'reset' };

// Elapsed time lets the simulation catch up after the app has been backgrounded.
export function extractionReducer(
	state: ExtractionState,
	action: ExtractionAction,
): ExtractionState {
	if (action.type === 'reset') return initialExtraction;
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
	return { ...state, phase, result: phase === 'ready' ? sampleResult : null };
}
