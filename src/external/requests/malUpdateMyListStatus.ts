export type MALUpdateMyListStatuses =
	| "watching"
	| "completed"
	| "plan_to_watch"
	| "dropped";

export default interface MALUpdateMyListStatus {
	status?: MALUpdateMyListStatuses;
	num_watched_episodes?: number;
	start_date?: string;
	finish_date?: string;
}
