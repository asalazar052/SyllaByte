import { and, eq, sql } from 'drizzle-orm';

import { SyllaColors } from '@/constants/theme';
import { type CourseDraft, validateDraft } from '@/features/upload/review-draft';

import { db } from './client';
import { courseMaterials, courses, events, officeHours, professors, semesters } from './schema';

export function saveReviewedCourse(
	draft: CourseDraft,
	syllabusName: string,
	syllabusPath: string | null,
	syllabusUploadedAt: number | null = null,
) {
	const error = validateDraft(draft);
	if (error) throw new Error(error);
	const nullable = (value: string) => value.trim() || null;
	return db.transaction((tx) => {
		let semester = tx
			.select()
			.from(semesters)
			.where(sql`lower(${semesters.name}) = lower(${draft.semester.trim()})`)
			.get();
		if (!semester)
			semester = tx
				.insert(semesters)
				.values({ name: draft.semester.trim() })
				.returning()
				.get();
		const duplicate = tx
			.select({ id: courses.id })
			.from(courses)
			.where(
				and(
					eq(courses.semesterId, semester.id),
					sql`lower(${courses.code}) = lower(${draft.code.trim()})`,
				),
			)
			.get();
		if (duplicate)
			throw new Error(
				'This course already exists in that semester. Change the course code or semester to add another course.',
			);
		const professor = tx
			.insert(professors)
			.values({ name: nullable(draft.professorName), email: nullable(draft.professorEmail) })
			.returning()
			.get();
		const { id } = tx
			.insert(courses)
			.values({
				semesterId: semester.id,
				professorId: professor.id,
				code: draft.code.trim(),
				title: draft.title.trim(),
				credits: draft.credits.trim() ? Number(draft.credits) : null,
				days: nullable(draft.days),
				startTime: draft.startTime,
				endTime: draft.endTime,
				location: nullable(draft.location),
				icon: 'courses',
				iconBackground: SyllaColors.paleBlue,
				syllabusName,
				syllabusPath,
				syllabusUploadedAt,
				isSample: true,
			})
			.returning({ id: courses.id })
			.get();
		if (draft.officeDays || draft.officeStart !== null || draft.officeLocation.trim())
			tx.insert(officeHours)
				.values({
					professorId: professor.id,
					courseId: id,
					days: nullable(draft.officeDays),
					startTime: draft.officeStart,
					endTime: draft.officeEnd,
					location: nullable(draft.officeLocation),
				})
				.run();
		for (const item of draft.dates.filter((item) => item.include))
			tx.insert(events)
				.values({
					courseId: id,
					title: item.title.trim(),
					date: item.date,
					type: /exam|midterm|final/i.test(item.title) ? 'exam' : 'assignment',
					startTime: item.time
						? Number(item.time.slice(0, 2)) * 60 + Number(item.time.slice(3))
						: null,
				})
				.run();
		for (const item of draft.materials.filter((item) => item.include))
			tx.insert(courseMaterials)
				.values({ courseId: id, title: item.title.trim(), details: nullable(item.details) })
				.run();
		return id;
	});
}
