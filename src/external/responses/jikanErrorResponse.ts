export default interface JikanErrorResponse {
	status: number;
	type: string;
	message?: string;
	messages?: { [key: string]: string[] };
	error: string | null;
}
