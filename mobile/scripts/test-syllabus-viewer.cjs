// Run with Node 22.13+: node scripts/test-syllabus-viewer.cjs
// Exercise the real storage/save modules against an isolated filesystem and SQLite database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');
const { BaseSQLiteDatabase, SQLiteSyncDialect } = require('drizzle-orm/sqlite-core');
const { BetterSQLiteSession } = require('drizzle-orm/better-sqlite3/session');

const root = path.resolve(__dirname, '..');
const sqlite = new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys = ON');
const journal = JSON.parse(fs.readFileSync(path.join(root, 'drizzle/meta/_journal.json')));
for (const entry of journal.entries) {
	sqlite.exec(fs.readFileSync(path.join(root, `drizzle/${entry.tag}.sql`), 'utf8'));
	if (entry.idx === 5)
		sqlite.exec(
			"INSERT INTO semesters(name) VALUES ('Fall 2026'); INSERT INTO courses(id, semester_id, code, title, icon, icon_background) VALUES (1,1,'OLD','Older course','courses','#fff')",
		);
}
assert.deepEqual(
	sqlite
		.prepare("SELECT name FROM pragma_table_info('courses') WHERE name LIKE 'syllabus%'")
		.all(),
	[],
	'Syllabus details live in the files table, not on courses',
);

const client = {
	prepare(sql) {
		const statement = sqlite.prepare(sql);
		return {
			run: (...args) => statement.run(...args),
			get: (...args) => statement.get(...args),
			all: (...args) => statement.all(...args),
			raw: () => ({
				get: (...args) => {
					const row = statement.get(...args);
					return row && Object.values(row);
				},
				all: (...args) => statement.all(...args).map(Object.values),
			}),
		};
	},
	transaction(callback) {
		return {
			deferred: (...args) => {
				sqlite.exec('BEGIN');
				try {
					const result = callback(...args);
					sqlite.exec('COMMIT');
					return result;
				} catch (error) {
					sqlite.exec('ROLLBACK');
					throw error;
				}
			},
		};
	},
};
const dialect = new SQLiteSyncDialect();
const db = new BaseSQLiteDatabase('sync', dialect, new BetterSQLiteSession(client, dialect));
const files = new Map([['source.pdf', Buffer.from('%PDF-1.4\nOriginal syllabus bytes')]]);
const shares = [];
let nativeReady = false;
let pdfImports = 0;
class Directory {
	constructor(...parts) {
		this.uri = parts.map((value) => value.uri ?? value).join('/');
	}
	create() {}
}
class File extends Directory {
	get exists() {
		return files.has(this.uri);
	}
	get size() {
		return files.get(this.uri)?.length ?? 0;
	}
	async digest(algorithm) {
		assert.equal(algorithm, 'MD5');
		return require('node:crypto').createHash('md5').update(files.get(this.uri)).digest('hex');
	}
	async copy(destination) {
		await Promise.resolve();
		files.set(destination.uri, Buffer.from(files.get(this.uri)));
	}
	delete() {
		files.delete(this.uri);
	}
}
const cache = new Map();
function load(relative) {
	const filename = path.resolve(root, relative);
	if (cache.has(filename)) return cache.get(filename).exports;
	const mod = new Module(filename, module);
	cache.set(filename, mod);
	mod.filename = filename;
	mod.paths = module.paths;
	mod.require = (specifier) => {
		if (specifier === 'react')
			return {
				useState: (initializer) => [initializer()],
				useRef: (value) => ({ current: value }),
				useEffect: () => {},
			};
		if (specifier === 'react-native')
			return {
				View: 'View',
				ActivityIndicator: 'ActivityIndicator',
				TurboModuleRegistry: { get: () => (nativeReady ? {} : null) },
			};
		if (specifier === 'react-native-pdf') {
			pdfImports++;
			return { default: 'Pdf' };
		}
		if (specifier === '@/components/ui/app-text') return { AppText: 'Text' };
		if (specifier === './client') return { db };
		if (specifier === 'expo-file-system')
			return { File, Directory, Paths: { document: 'documents' } };
		if (specifier === 'expo-sharing')
			return {
				isAvailableAsync: async () => true,
				shareAsync: async (uri) => shares.push(uri),
			};
		if (specifier === '@/constants/theme') return { SyllaColors: { paleBlue: '#eaf4ff' } };
		if (specifier === '../constants/palette') return require('../src/constants/palette.js');
		if (specifier.startsWith('@/')) return load(`src/${specifier.slice(2)}.ts`);
		if (specifier.startsWith('.'))
			return load(`${path.resolve(path.dirname(filename), specifier)}.ts`);
		return require(specifier);
	};
	mod._compile(
		ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2020,
				jsx: ts.JsxEmit.ReactJSX,
			},
		}).outputText,
		filename,
	);
	return mod.exports;
}

async function main() {
	const { PdfDocument } = load('src/features/syllabus/pdf-document.native.tsx');
	assert.equal(pdfImports, 0, 'Route imports must not load native PDF dependencies');
	assert.equal(
		PdfDocument({ page: 1 }).type,
		'View',
		'Older builds must show an unavailable state instead of crashing',
	);
	assert.equal(pdfImports, 0, 'Missing native modules must not trigger a PDF import');
	nativeReady = true;
	assert.equal(PdfDocument({ page: 1 }).type, 'Pdf');
	assert.equal(pdfImports, 1, 'Load the renderer only inside a supported native build');
	const storage = load('src/features/upload/syllabus-storage.native.ts');
	const retained = await storage.retainSyllabus('source.pdf', 'course');
	const name = retained.path;
	assert.equal(name, 'course.pdf');
	assert.equal(retained.bytes, files.get('source.pdf').length);
	assert.match(retained.checksum, /^[0-9a-f]{32}$/);
	const { uri } = await storage.resolveSyllabus(name);
	assert.deepEqual(files.get(uri), files.get('source.pdf'), 'Viewer must use original PDF bytes');
	await storage.shareSyllabus(name);
	assert.deepEqual(shares, [uri], 'Sharing must use the same retained original');
	await assert.rejects(storage.resolveSyllabus('../source.pdf'), /invalid/);
	await assert.rejects(storage.resolveSyllabus('missing.pdf'), /could not be found/);
	files.set('documents/syllabi/empty.pdf', Buffer.alloc(0));
	await assert.rejects(storage.resolveSyllabus('empty.pdf'), /empty/);

	const { createSampleDraft, validateDraft } = load('src/features/upload/review-draft.ts');
	const draft = createSampleDraft();
	assert.equal(validateDraft(draft), null, 'sample items no longer require review confirmation');
	const requiredOnly = {
		...draft,
		credits: '',
		days: '',
		startTime: null,
		endTime: null,
		location: '',
		professorName: '',
		professorEmail: '',
		officeDays: '',
		officeStart: null,
		officeEnd: null,
		officeLocation: '',
		dates: draft.dates.map((item) => ({ ...item, include: false, date: '' })),
		materials: draft.materials.map((item) => ({ ...item, include: false, title: '' })),
	};
	assert.equal(validateDraft(requiredOnly), null, 'excluded optional items do not block saving');
	assert.ok(validateDraft({ ...requiredOnly, code: '' }), 'course code is required');
	draft.dates.forEach((item) => {
		item.confirmed = true;
	});
	draft.materials.forEach((item) => {
		item.confirmed = true;
	});
	const { saveReviewedCourse } = load('src/db/save-course.ts');
	const selectedAt = 1793142000000;
	const savedId = saveReviewedCourse(draft, {
		filename: 'My original syllabus.pdf',
		storagePath: name,
		bytes: retained.bytes,
		checksum: retained.checksum,
		uploadedAt: selectedAt,
	});
	const saved = sqlite
		.prepare(
			'SELECT f.type, f.filename, f.storage_path, f.uploaded_at, f.bytes, f.checksum, f.semester_id, c.semester_id AS course_semester FROM files f JOIN courses c ON c.id = f.course_id WHERE f.course_id = ?',
		)
		.get(savedId);
	assert.deepEqual(
		{ ...saved },
		{
			type: 'syllabus',
			filename: 'My original syllabus.pdf',
			storage_path: name,
			uploaded_at: selectedAt,
			bytes: retained.bytes,
			checksum: retained.checksum,
			semester_id: saved.course_semester,
			course_semester: saved.course_semester,
		},
	);
	assert.equal(
		sqlite.prepare('SELECT title FROM courses WHERE id=1').get().title,
		'Older course',
		'Migration must preserve existing attachment paths',
	);
	storage.removeSyllabus(name);
	await assert.rejects(storage.resolveSyllabus(name), /could not be found/);
	sqlite.close();
	console.log(
		'PASS: original PDF retention, resolution, sharing, unavailable files, metadata persistence, and migration compatibility.',
	);
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
