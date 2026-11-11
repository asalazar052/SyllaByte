import { eq } from 'drizzle-orm';

import { removeSyllabus } from '@/features/upload/syllabus-storage';

import { db } from './client';
import { courses, files, professors } from './schema';

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
}
