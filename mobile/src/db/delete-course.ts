import { eq } from 'drizzle-orm';

import { removeSyllabus } from '@/features/upload/syllabus-storage';

import { db } from './client';
import { courses, professors } from './schema';

export function deleteCourse(id: string) {
	db.transaction((tx) => {
		const course = tx.select().from(courses).where(eq(courses.id, id)).get();
		if (!course) return;

		// Foreign keys cascade to dates, materials, review fields, and office hours.
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
		if (course.syllabusPath) {
			const shared = tx
				.select({ id: courses.id })
				.from(courses)
				.where(eq(courses.syllabusPath, course.syllabusPath))
				.limit(1)
				.get();
			// Run cleanup last. If it fails, roll back the database changes for retry.
			if (!shared) removeSyllabus(course.syllabusPath);
		}
		// Keep the semester so deleting its last course does not trigger sample seeding.
	});
}
