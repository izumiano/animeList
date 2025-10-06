export default interface MALUpdateMyListStatus {
  status?: "watching" | "completed" | "plan_to_watch";
  num_watched_episodes?: number;
  start_date?: string;
  finish_date?: string;
}
