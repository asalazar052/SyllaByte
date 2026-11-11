const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const journal = JSON.parse(fs.readFileSync(path.join(root, 'drizzle/meta/_journal.json')));
const migration = (tag) => fs.readFileSync(path.join(root, 'drizzle', `${tag}.sql`), 'utf8');
const filename = path.join(root, 'src/db/legacy-upload-upgrade.ts');
const mod = new Module(filename, module);
mod._compile(
	ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS },
	}).outputText,
	filename,
);
const { prepareLegacyUploadUpgrade, restoreLegacyUploads } = mod.exports;

function connection(database) {
	return {
		execSync: (sql) => database.exec(sql),
		getFirstSync: (sql, ...params) => database.prepare(sql).get(...params) ?? null,
		getAllSync: (sql, ...params) => database.prepare(sql).all(...params),
		runSync: (sql, ...params) => {
			const result = database.prepare(sql).run(...params);
			return {
				changes: Number(result.changes),
				lastInsertRowId: Number(result.lastInsertRowid),
			};
		},
		withTransactionSync: (callback) => {
			database.exec('BEGIN');
			try {
				callback();
				database.exec('COMMIT');
			} catch (error) {
				database.exec('ROLLBACK');
				throw error;
			}
		},
	};
}

// Existing origin/main installs keep their rows and apply only the new migration.
const main = new DatabaseSync(':memory:');
main.exec('PRAGMA foreign_keys = ON');
for (const entry of journal.entries.filter((entry) => entry.idx <= 5))
	main.exec(migration(entry.tag));
main.exec(
	"INSERT INTO semesters(id,name) VALUES (8,'Spring 2027'); INSERT INTO courses(id,semester_id,code,title,icon,icon_background) VALUES (17,8,'MAIN 101','Incoming course','courses','#fff')",
);
prepareLegacyUploadUpgrade(connection(main));
for (const entry of journal.entries.filter((entry) => entry.idx > 5))
	main.exec(migration(entry.tag));
restoreLegacyUploads(connection(main));
assert.equal(main.prepare('SELECT title FROM courses WHERE id=17').get().title, 'Incoming course');
assert.equal(main.prepare('SELECT count(*) AS n FROM settings').get().n, 1);
assert.equal(
	main.prepare("SELECT name FROM sqlite_master WHERE name='__upload_merge_backup'").get(),
	undefined,
);
main.close();

// Existing upload-branch installs have different migrations 0001/0002 and text IDs.
const legacy = new DatabaseSync(':memory:');
legacy.exec('PRAGMA foreign_keys = ON');
legacy.exec(migration('0000_init'));
for (const name of ['0001_futuristic_ego', '0002_optimal_next_avengers'])
	legacy.exec(
		fs.readFileSync(path.join(__dirname, 'fixtures/legacy-upload', `${name}.sql`), 'utf8'),
	);
legacy.exec(
	"INSERT INTO semesters VALUES(1,'Fall 2026'); INSERT INTO professors VALUES(1,'Uploaded professor','prof@example.edu'); INSERT INTO courses(id,semester_id,professor_id,code,title,icon,icon_background,syllabus_name,syllabus_path,syllabus_uploaded_at,is_sample) VALUES ('import-original',1,1,'PDF 101','Uploaded course','courses','#fff','Original.pdf','original.pdf',1793142000000,1); INSERT INTO office_hours(professor_id,course_id,days) VALUES(1,'import-original','MW'); INSERT INTO course_review_fields(course_id,label,value) VALUES('import-original','Final','Check time'); INSERT INTO course_dates(course_id,title,date,time) VALUES('import-original','Midterm exam','2026-11-18','10:30'); INSERT INTO course_materials(course_id,title,details) VALUES('import-original','Original book','Second edition')",
);
const adapter = connection(legacy);
prepareLegacyUploadUpgrade(adapter);
prepareLegacyUploadUpgrade(adapter); // A restart before migration must not overwrite the backup.
for (const entry of journal.entries.filter((entry) => entry.when > 1793163215280))
	legacy.exec(migration(entry.tag));
legacy.exec(
	"CREATE TRIGGER fail_restore BEFORE INSERT ON course_materials BEGIN SELECT RAISE(ABORT,'injected failure'); END",
);
assert.throws(() => restoreLegacyUploads(adapter), /injected failure/);
assert.equal(
	legacy.prepare('SELECT count(*) AS n FROM courses').get().n,
	0,
	'Failed recovery must roll back partial inserts',
);
assert.ok(
	legacy.prepare('SELECT payload FROM __upload_merge_backup WHERE id=1').get(),
	'Keep backup for recovery retry',
);
legacy.exec('DROP TRIGGER fail_restore');
restoreLegacyUploads(adapter);
const course = legacy.prepare('SELECT * FROM courses').get();
assert.equal(typeof course.id, 'number');
assert.equal(course.code, 'PDF 101');
const syllabus = legacy.prepare('SELECT * FROM files WHERE course_id=?').get(course.id);
assert.equal(syllabus.filename, 'Original.pdf');
assert.equal(syllabus.storage_path, 'original.pdf');
assert.equal(syllabus.uploaded_at, 1793142000000);
assert.equal(syllabus.type, 'syllabus');
assert.equal(legacy.prepare('SELECT start_time,type,course_id FROM events').get().start_time, 630);
assert.equal(legacy.prepare('SELECT type FROM events').get().type, 'exam');
assert.equal(
	legacy.prepare('SELECT details FROM course_materials').get().details,
	'Second edition',
);
assert.equal(legacy.prepare('SELECT course_id FROM office_hours').get().course_id, course.id);
assert.equal(legacy.prepare('SELECT value FROM course_review_fields').get().value, 'Check time');
assert.deepEqual(legacy.prepare('PRAGMA foreign_key_check').all(), []);
restoreLegacyUploads(adapter); // Completed recovery must not duplicate anything.
assert.equal(legacy.prepare('SELECT count(*) AS n FROM courses').get().n, 1);
legacy.close();
console.log(
	'PASS: incoming databases, upload-branch databases, numeric IDs, preserved PDFs/resources, rollback, and restart-safe recovery.',
);
