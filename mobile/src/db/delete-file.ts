import { eq } from 'drizzle-orm';

import { removeSyllabus } from '@/features/upload/syllabus-storage';

import { db } from './client';
import { files } from './schema';

// Removes an uploaded file and its retained copy on the device, leaving all related course data.
export function deleteFile(id: number) {
	db.transaction((tx) => {
		const file = tx.select().from(files).where(eq(files.id, id)).get();
		if (!file) return;
		tx.delete(files).where(eq(files.id, id)).run();
		if (!file.storagePath) return;
		const shared = tx
			.select({ id: files.id })
			.from(files)
			.where(eq(files.storagePath, file.storagePath))
			.limit(1)
			.get();
		// Run cleanup last. If it fails, roll back the database change for retry.
		if (!shared) removeSyllabus(file.storagePath);
	});
}
