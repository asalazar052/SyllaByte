import { and, eq } from 'drizzle-orm';

import { db } from './client';
import { courseReviewFields, courses, officeHours, professors } from './schema';

export function updateReviewField(id: number, value: string) {
	db.update(courseReviewFields)
		.set({ value: value.trim() })
		.where(eq(courseReviewFields.id, id))
		.run();
}

type CourseEdit = Pick<
	typeof courses.$inferInsert,
	'days' | 'startTime' | 'endTime' | 'location' | 'credits'
>;
type ProfessorEdit = Partial<Omit<typeof professors.$inferInsert, 'id'>>;
type OfficeHoursEdit = Omit<typeof officeHours.$inferInsert, 'professorId' | 'courseId'>;

export function updateCourse(id: string, values: CourseEdit) {
	db.update(courses).set(values).where(eq(courses.id, id)).run();
}

export function updateProfessor(id: number, values: ProfessorEdit) {
	db.update(professors).set(values).where(eq(professors.id, id)).run();
}

// Adds, updates, or (when every cell is empty) removes a professor's office hours for a course.
export function saveOfficeHours(professorId: number, courseId: string, values: OfficeHoursEdit) {
	if (Object.values(values).every((value) => value === null || value === undefined)) {
		db.delete(officeHours)
			.where(
				and(eq(officeHours.professorId, professorId), eq(officeHours.courseId, courseId)),
			)
			.run();
		return;
	}
	db.insert(officeHours)
		.values({ professorId, courseId, ...values })
		.onConflictDoUpdate({
			target: [officeHours.professorId, officeHours.courseId],
			set: values,
		})
		.run();
}
