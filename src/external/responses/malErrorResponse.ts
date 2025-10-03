export default interface MalErrorResponse {
  status: number;
  error: string;
  message: string;
  hint?: string;
}
