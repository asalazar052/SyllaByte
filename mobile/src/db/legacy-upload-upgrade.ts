import type { SQLiteDatabase } from 'expo-sqlite';

// main's 0002 migration resets the old seed-only tables. The upload branch has
// real user edits in those tables, so retain them before applying main's history.
type LegacyRow = Record<string, string | number | null>;
const tables = [
	'semesters',
	'professors',
	'courses',
	'office_hours',
	'course_review_fields',
	'course_dates',
	'course_materials',
] as const;
type Snapshot = Record<(typeof tables)[number], LegacyRow[]>;
type Connection = Pick<
	SQLiteDatabase,
	'getAllSync' | 'getFirstSync' | 'runSync' | 'execSync' | 'withTransactionSync'
>;

export function prepareLegacyUploadUpgrade(db: Connection) {
	const columns = db.getAllSync<{ name: string; type: string }>('PRAGMA table_info(courses)');
	if (
		!columns.some((column) => column.name === 'id' && column.type.toUpperCase() === 'TEXT') ||
		!columns.some((column) => column.name === 'syllabus_path')
	)
		return;
	db.withTransactionSync(() => {
		db.execSync(
			'CREATE TABLE IF NOT EXISTS __upload_merge_backup (id INTEGER PRIMARY KEY, payload TEXT NOT NULL)',
		);
		if (!db.getFirstSync('SELECT id FROM __upload_merge_backup WHERE id = 1')) {
			const snapshot = {} as Snapshot;
			for (const table of tables)
				snapshot[table] = db.getFirstSync(
					'SELECT name FROM sqlite_master WHERE type = ? AND name = ?',
					'table',
					table,
				)
					? db.getAllSync<LegacyRow>(`SELECT * FROM ${table}`)
					: [];
			db.runSync(
				'INSERT INTO __upload_merge_backup (id, payload) VALUES (1, ?)',
				JSON.stringify(snapshot),
			);
		}
		// These branch-only tables are recreated with integer foreign keys in 0006.
		db.execSync('DROP TABLE IF EXISTS course_dates; DROP TABLE IF EXISTS course_materials;');
	});
}

export function restoreLegacyUploads(db: Connection) {
	if (
		!db.getFirstSync(
			'SELECT name FROM sqlite_master WHERE type = ? AND name = ?',
			'table',
			'__upload_merge_backup',
		)
	)
		return;
	const backup = db.getFirstSync<{ payload: string }>(
		'SELECT payload FROM __upload_merge_backup WHERE id = 1',
	);
	if (!backup) return;
	const data = JSON.parse(backup.payload) as Snapshot;
	db.withTransactionSync(() => {
		const semesters = new Map<string, number>();
		const professors = new Map<string, number>();
		const courses = new Map<string, number>();
		for (const row of data.semesters) {
			const existing = db.getFirstSync<{ id: number }>(
				'SELECT id FROM semesters WHERE name = ?',
				row.name,
			);
			const id =
				existing?.id ??
				db.runSync(
					'INSERT INTO semesters (name, start_date, end_date) VALUES (?, ?, ?)',
					row.name,
					row.start_date ?? null,
					row.end_date ?? null,
				).lastInsertRowId;
			semesters.set(String(row.id), id);
		}
		for (const row of data.professors)
			professors.set(
				String(row.id),
				db.runSync(
					'INSERT INTO professors (name, email) VALUES (?, ?)',
					row.name,
					row.email,
				).lastInsertRowId,
			);
		for (const row of data.courses) {
			const semesterId = semesters.get(String(row.semester_id));
			if (!semesterId) throw new Error('Could not recover an uploaded course semester.');
			const id = db.runSync(
				`INSERT INTO courses (semester_id, professor_id, code, title, days, start_time, end_time, location, credits, icon, icon_background, is_sample) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				semesterId,
				professors.get(String(row.professor_id)) ?? null,
				row.code,
				row.title,
				row.days,
				row.start_time,
				row.end_time,
				row.location,
				row.credits,
				row.icon,
				row.icon_background,
				row.is_sample ?? 0,
			).lastInsertRowId;
			if (row.syllabus_name)
				db.runSync(
					'INSERT INTO files (semester_id, course_id, type, filename, bytes, storage_path, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
					semesterId,
					id,
					'syllabus',
					row.syllabus_name,
					0,
					row.syllabus_path ?? null,
					row.syllabus_uploaded_at ?? null,
				);
			courses.set(String(row.id), id);
		}
		for (const row of data.office_hours) {
			const courseId = courses.get(String(row.course_id));
			const professorId = professors.get(String(row.professor_id));
			if (!courseId || !professorId)
				throw new Error('Could not recover uploaded office hours.');
			db.runSync(
				'INSERT INTO office_hours (professor_id, course_id, days, start_time, end_time, location) VALUES (?, ?, ?, ?, ?, ?)',
				professorId,
				courseId,
				row.days,
				row.start_time,
				row.end_time,
				row.location,
			);
		}
		for (const table of ['course_review_fields', 'course_materials', 'course_dates'] as const)
			for (const row of data[table]) {
				const courseId = courses.get(String(row.course_id));
				if (!courseId) throw new Error('Could not recover an uploaded course resource.');
				if (table === 'course_review_fields')
					db.runSync(
						'INSERT INTO course_review_fields (course_id, label, value) VALUES (?, ?, ?)',
						courseId,
						row.label,
						row.value,
					);
				else if (table === 'course_materials')
					db.runSync(
						'INSERT INTO course_materials (course_id, title, details) VALUES (?, ?, ?)',
						courseId,
						row.title,
						row.details,
					);
				else {
					const time = row.time ? String(row.time).split(':').map(Number) : null;
					db.runSync(
						'INSERT INTO events (course_id, type, title, date, start_time) VALUES (?, ?, ?, ?, ?)',
						courseId,
						/exam|midterm|final/i.test(String(row.title)) ? 'exam' : 'assignment',
						row.title,
						row.date,
						time ? time[0] * 60 + time[1] : null,
					);
				}
			}
		// Commit recovery and removal of the backup together, making retries safe.
		db.execSync('DROP TABLE __upload_merge_backup');
	});
}
