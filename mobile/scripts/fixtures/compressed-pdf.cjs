const zlib = require('node:zlib');
// A PDF whose catalog, page tree and pages all sit inside one deflated object stream, found through a
// cross-reference stream: the layout that scanning the bytes for pages can't see into.
function compressedPdf(pageCount) {
	const kids = Array.from({ length: pageCount }, (_, index) => index + 3);
	const objects = [
		'<< /Type /Catalog /Pages 2 0 R >>',
		`<< /Type /Pages /Kids [${kids.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageCount} >>`,
		...kids.map(() => '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>'),
	];
	let body = '';
	const pairs = [];
	objects.forEach((object, index) => {
		pairs.push(`${index + 1} ${body.length}`);
		body += `${object}\n`;
	});
	const header = `${pairs.join(' ')}\n`;
	const stream = zlib.deflateSync(Buffer.from(header + body));
	const streamNumber = objects.length + 1;
	const xrefNumber = objects.length + 2;
	const parts = [Buffer.from('%PDF-1.5\n')];
	const offsetOf = {};
	const add = (number, buffer) => {
		offsetOf[number] = parts.reduce((total, part) => total + part.length, 0);
		parts.push(buffer);
	};
	add(
		streamNumber,
		Buffer.concat([
			Buffer.from(
				`${streamNumber} 0 obj\n<< /Type /ObjStm /N ${objects.length} /First ${header.length} /Filter /FlateDecode /Length ${stream.length} >>\nstream\n`,
			),
			stream,
			Buffer.from('\nendstream\nendobj\n'),
		]),
	);
	const entries = [Buffer.from([0, 0, 0, 255])];
	for (let number = 1; number <= objects.length; number++)
		entries.push(Buffer.from([2, 0, streamNumber, number - 1]));
	entries.push(Buffer.from([1, offsetOf[streamNumber] >> 8, offsetOf[streamNumber] & 255, 0]));
	const xrefOffset = parts.reduce((total, part) => total + part.length, 0);
	entries.push(Buffer.from([1, xrefOffset >> 8, xrefOffset & 255, 0]));
	const table = Buffer.concat(entries);
	parts.push(
		Buffer.concat([
			Buffer.from(
				`${xrefNumber} 0 obj\n<< /Type /XRef /W [1 2 1] /Index [0 ${xrefNumber + 1}] /Size ${xrefNumber + 1} /Root 1 0 R /Length ${table.length} >>\nstream\n`,
			),
			table,
			Buffer.from(`\nendstream\nendobj\nstartxref\n${xrefOffset}\n%%EOF\n`),
		]),
	);
	return Buffer.concat(parts);
}
module.exports = { compressedPdf };
