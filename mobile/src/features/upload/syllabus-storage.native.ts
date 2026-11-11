import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export type RetainedSyllabus = {
	// Name of the copy in the syllabi folder.
	path: string | null;
	bytes: number | null;
	// MD5 of the copy as 32 lowercase hex digits.
	checksum: string | null;
};

export async function retainSyllabus(uri: string, courseId: string): Promise<RetainedSyllabus> {
	const directory = new Directory(Paths.document, 'syllabi');
	directory.create({ idempotent: true, intermediates: true });
	const name = `${courseId}.pdf`;
	const destination = new File(directory, name);
	try {
		await new File(uri).copy(destination);
		const digest = (await destination.digest('MD5')).toLowerCase();
		return {
			path: name,
			bytes: destination.size,
			checksum: /^[0-9a-f]{32}$/.test(digest) ? digest : null,
		};
	} catch (error) {
		try {
			if (destination.exists) destination.delete();
		} catch {
			/* Keep the copy error. */
		}
		throw error;
	}
}
export function removeSyllabus(path: string) {
	const file = new File(Paths.document, 'syllabi', path);
	if (file.exists) file.delete();
}
export async function resolveSyllabus(path: string): Promise<{ uri: string }> {
	if (!path || path.includes('/') || path.includes('\\') || path === '..') {
		throw new Error('The saved syllabus path is invalid.');
	}
	const file = new File(Paths.document, 'syllabi', path);
	if (!file.exists) throw new Error('The saved syllabus could not be found.');
	if (file.size === 0) throw new Error('The saved PDF is empty.');
	return { uri: file.uri };
}
// The name to share a PDF under: the user's original filename, without any folder parts, ending in .pdf.
function exportName(filename: string) {
	const base = filename.split(/[\\/]/).pop()?.trim() ?? '';
	if (!base || base === '.' || base === '..') return 'syllabus.pdf';
	return /\.pdf$/i.test(base) ? base : `${base}.pdf`;
}

// Shares the retained PDF. The copy on the device is named after the course, so when `filename` is given
// the PDF is shared under that name instead (as a temporary copy, removed afterwards).
export async function shareSyllabus(path: string, filename?: string) {
	const { uri } = await resolveSyllabus(path);
	if (!(await Sharing.isAvailableAsync()))
		throw new Error('No PDF sharing options are available on this device.');
	if (!filename) {
		await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
		return;
	}
	const directory = new Directory(Paths.cache, `export-${Date.now()}`);
	directory.create({ idempotent: true, intermediates: true });
	try {
		const copy = new File(directory, exportName(filename));
		await new File(uri).copy(copy);
		await Sharing.shareAsync(copy.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
	} finally {
		try {
			directory.delete();
		} catch {
			/* The cache is cleared by the system anyway. */
		}
	}
}
