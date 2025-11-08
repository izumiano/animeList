export function detailsPageValid(path: string) {
	const id = /\/details\/(?<id>[^/?#]+)/g.exec(path)?.groups?.id;
	return { valid: id != null, value: id };
}
