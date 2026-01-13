export function statsPageValid(path: string) {
	return { valid: !!/\/stats/g.exec(path) };
}
