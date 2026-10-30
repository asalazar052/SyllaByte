import { and, eq } from 'drizzle-orm';

import { db } from './client';
import { courses, officeHours, professors, settings, SETTINGS_ID } from './schema';

type CourseEdit = Pick<
	typeof courses.$inferInsert,
	'days' | 'startTime' | 'endTime' | 'location' | 'credits'
>;
type ProfessorEdit = Partial<Omit<typeof professors.$inferInsert, 'id'>>;
type SettingsEdit = Partial<Omit<typeof settings.$inferInsert, 'id'>>;
type OfficeHoursEdit = Omit<typeof officeHours.$inferInsert, 'id' | 'professorId' | 'courseId'>;

export function updateSettings(values: SettingsEdit) {
	db.update(settings).set(values).where(eq(settings.id, SETTINGS_ID)).run();
}

export function updateCourse(id: number, values: CourseEdit) {
	db.update(courses).set(values).where(eq(courses.id, id)).run();
}

export function updateProfessor(id: number, values: ProfessorEdit) {
	db.update(professors).set(values).where(eq(professors.id, id)).run();
}

// Adds, updates, or (when every cell is empty) removes a professor's office hours for a course.
export function saveOfficeHours(professorId: number, courseId: number, values: OfficeHoursEdit) {
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
