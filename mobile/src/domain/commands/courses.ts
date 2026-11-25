import { and, eq } from 'drizzle-orm';

import { invalidateTables } from '@/db/change-bus';
import { db } from '@/db/client';
import {
	courseMaterials,
	courseReviewFields,
	courses,
	events,
	files,
	officeHours,
	professors,
} from '@/db/schema';
import { removeSyllabus } from '@/lib/syllabus-storage';

type CourseEdit = Pick<
	typeof courses.$inferInsert,
	'days' | 'startTime' | 'endTime' | 'location' | 'credits'
>;
type ProfessorEdit = Partial<Omit<typeof professors.$inferInsert, 'id'>>;
type OfficeHoursEdit = Omit<typeof officeHours.$inferInsert, 'id' | 'professorId' | 'courseId'>;

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

// Deletes a course along with its dates, materials, review fields, office hours and files, and the
// professor if no other course uses them. The retained PDF is removed last: if that fails, the database
// changes roll back so the delete can be retried.
export function deleteCourse(id: number) {
	db.transaction((tx) => {
		const course = tx.select().from(courses).where(eq(courses.id, id)).get();
		if (!course) return;

		const copies = tx
			.select({ path: files.storagePath })
			.from(files)
			.where(eq(files.courseId, id))
			.all();

		// Foreign keys cascade to dates, materials, review fields, office hours, and files.
		tx.delete(courses).where(eq(courses.id, id)).run();
		if (course.professorId !== null) {
			const shared = tx
				.select({ id: courses.id })
				.from(courses)
				.where(eq(courses.professorId, course.professorId))
				.limit(1)
				.get();
			if (!shared) tx.delete(professors).where(eq(professors.id, course.professorId)).run();
		}
		for (const { path } of copies) {
			if (!path) continue;
			const shared = tx
				.select({ id: files.id })
				.from(files)
				.where(eq(files.storagePath, path))
				.limit(1)
				.get();
			// Run cleanup last. If it fails, roll back the database changes for retry.
			if (!shared) removeSyllabus(path);
		}
		// Keep the semester so deleting its last course does not trigger sample seeding.
	});
	// The cascades above delete rows in other tables. They are marked as changed by hand, so screens showing
	// them refresh without relying on the database to report every cascaded row.
	invalidateTables(events, files, courseMaterials, courseReviewFields, officeHours, professors);
}
