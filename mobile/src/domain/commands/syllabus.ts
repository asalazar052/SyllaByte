import { and, eq, sql } from 'drizzle-orm';

import { SyllaColors } from '@/constants/theme';
import { db } from '@/db/client';
import {
	courseMaterials,
	courses,
	events,
	files,
	officeHours,
	professors,
	semesters,
} from '@/db/schema';
import { orNull } from '@/lib/input';
import { removeSyllabus, retainSyllabus } from '@/lib/syllabus-storage';

import { type CourseDraft, validateDraft } from '../course-draft';
import { inferEventType } from '../event-types';
import { recordNotification } from '../notifications/record';
import { syllabusText } from '../notifications/text';
import { ports } from '../ports';
import { catchUpReminders } from './notifications';

// The PDF the user picked.
export type PickedSyllabus = {
	uri: string;
	name: string;
	size?: number;
	// When the user picked it, in milliseconds since the epoch.
	uploadedAt: number;
};

// The retained copy of the PDF, which is recorded in the files table.
type SyllabusUpload = {
	filename: string;
	storagePath: string | null;
	bytes: number;
	// Null when the page count couldn't be worked out.
	pageCount: number | null;
	checksum: string | null;
	uploadedAt: number;
};

// Saves a reviewed course and the PDF it came from. It doesn't matter where the draft came from (the demo,
// the phone's own AI model or a server): this takes a draft the user has reviewed and keeps it. The PDF is
// copied into the app first and the copy is removed again if the course can't be saved.
export async function saveSyllabusCourse(draft: CourseDraft, file: PickedSyllabus) {
	const error = validateDraft(draft);
	if (error) throw new Error(error);
	const copy = await retainSyllabus(
		file.uri,
		`import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
	);
	let saved: { courseId: number; dateCount: number };
	try {
		// The new dates carry reminders, so reminders that went off until now are recorded first.
		catchUpReminders();
		saved = insertCourse(draft, {
			filename: file.name,
			storagePath: copy.path,
			bytes: copy.bytes ?? file.size ?? 0,
			pageCount: copy.pages,
			checksum: copy.checksum,
			uploadedAt: file.uploadedAt,
		});
	} catch (cause) {
		if (copy.path) {
			try {
				removeSyllabus(copy.path);
			} catch {
				/* Keep the save error for the retry. */
			}
		}
		throw cause;
	}
	// The saved dates carry reminders, so this is the moment to ask to send notifications.
	if (saved.dateCount > 0) void ports.requestNotificationPermission();
	return saved.courseId;
}

function insertCourse(draft: CourseDraft, syllabus: SyllabusUpload) {
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
			.values({ name: orNull(draft.professorName), email: orNull(draft.professorEmail) })
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
				days: orNull(draft.days),
				startTime: draft.startTime,
				endTime: draft.endTime,
				location: orNull(draft.location),
				icon: 'courses',
				iconBackground: SyllaColors.paleBlue,
				isSample: true,
			})
			.returning({ id: courses.id })
			.get();
		const dateCount = draft.dates.filter((item) => item.include).length;
		const { id: fileId } = tx
			.insert(files)
			.values({
				semesterId: semester.id,
				courseId: id,
				type: 'syllabus',
				filename: syllabus.filename,
				pageCount: syllabus.pageCount,
				bytes: syllabus.bytes,
				checksum: syllabus.checksum,
				storagePath: syllabus.storagePath,
				uploadedAt: syllabus.uploadedAt,
			})
			.returning({ id: files.id })
			.get();
		recordNotification(tx, {
			kind: 'syllabus',
			dedupeKey: `syllabus:${fileId}`,
			...syllabusText(draft.code.trim(), dateCount),
			courseId: id,
			createdAt: Date.now(),
		});
		if (draft.officeDays || draft.officeStart !== null || draft.officeLocation.trim())
			tx.insert(officeHours)
				.values({
					professorId: professor.id,
					courseId: id,
					days: orNull(draft.officeDays),
					startTime: draft.officeStart,
					endTime: draft.officeEnd,
					location: orNull(draft.officeLocation),
				})
				.run();
		for (const item of draft.dates.filter((item) => item.include))
			tx.insert(events)
				.values({
					courseId: id,
					title: item.title.trim(),
					date: item.date,
					type: inferEventType(item.title),
					startTime: item.time
						? Number(item.time.slice(0, 2)) * 60 + Number(item.time.slice(3))
						: null,
				})
				.run();
		for (const item of draft.materials.filter((item) => item.include))
			tx.insert(courseMaterials)
				.values({ courseId: id, title: item.title.trim(), details: orNull(item.details) })
				.run();
		return { courseId: id, dateCount };
	});
}
