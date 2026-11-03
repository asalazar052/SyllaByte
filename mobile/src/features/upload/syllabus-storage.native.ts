import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function retainSyllabus(uri: string, courseId: string): Promise<string | null> {
	const directory = new Directory(Paths.document, 'syllabi');
	directory.create({ idempotent: true, intermediates: true });
	const name = `${courseId}.pdf`;
	const destination = new File(directory, name);
	try {
		await new File(uri).copy(destination);
	} catch (error) {
		try {
			if (destination.exists) destination.delete();
		} catch {
			/* Keep the copy error. */
		}
		throw error;
	}
	return name;
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
export async function shareSyllabus(path: string) {
	const { uri } = await resolveSyllabus(path);
	if (!(await Sharing.isAvailableAsync()))
		throw new Error('No PDF sharing options are available on this device.');
	await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}
