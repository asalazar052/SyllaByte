import type { CourseDraft } from '@/domain/course-draft';

// The made-up course the demo extraction "finds" in any PDF. Real extraction replaces it.
export function createSampleDraft(): CourseDraft {
	return {
		code: 'CS 240',
		title: 'Data Structures',
		semester: 'Fall 2026',
		credits: '3',
		days: 'MWF',
		startTime: 600,
		endTime: 650,
		location: 'Technology Hall 208',
		professorName: 'Dr. Alex Morgan',
		professorEmail: 'amorgan@example.edu',
		officeDays: 'TTh',
		officeStart: 840,
		officeEnd: 900,
		officeLocation: 'Technology Hall 214',
		dates: [
			{
				id: 'project',
				title: 'Project 1',
				date: '2026-09-18',
				time: '23:59',
				include: true,
				needsReview: false,
				confirmed: true,
			},
			{
				id: 'midterm',
				title: 'Midterm exam',
				date: '2026-10-16',
				time: '10:00',
				include: true,
				needsReview: false,
				confirmed: true,
			},
			{
				id: 'final',
				title: 'Final exam',
				date: '2026-12-14',
				time: '',
				include: true,
				needsReview: true,
				confirmed: false,
			},
		],
		materials: [
			{
				id: 'textbook',
				title: 'Data Structures and Algorithms',
				details: 'Edition unspecified',
				include: true,
				needsReview: true,
				confirmed: false,
			},
			{
				id: 'portal',
				title: 'Course learning portal',
				details: 'Online resources',
				include: true,
				needsReview: false,
				confirmed: true,
			},
		],
	};
}
