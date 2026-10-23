// Mirrors testback/src/certificates/certificates.service.ts (view()).
export interface Certificate {
	code: string;
	holderName: string;
	holderNameAr: string | null;
	courseId: number;
	courseTitleEn: string;
	courseTitleAr: string;
	learningSeconds: number;
	issuedAt: string;
}
