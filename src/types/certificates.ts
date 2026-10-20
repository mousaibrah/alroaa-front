// Mirrors testback/src/certificates/certificates.service.ts (view()).
export interface Certificate {
	code: string;
	holderName: string;
	courseId: number;
	courseTitle: string;
	learningSeconds: number;
	issuedAt: string;
}
