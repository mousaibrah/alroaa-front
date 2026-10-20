// Error body returned by the NestJS backend.
export interface ApiErrorBody {
	statusCode: number;
	message: string | string[];
	error?: string;
}
