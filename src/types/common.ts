// Error body returned by the NestJS backend.
export interface ApiErrorBody {
	statusCode: number;
	message: string | string[];
	error?: string;
	// Machine-readable reason, e.g. EMAIL_NOT_VERIFIED (then `email` is set too).
	code?: string;
	email?: string;
}
