import { request } from './client';
import { endpoints } from './endpoints';
import type { Certificate } from '../types/certificates';

// Public: anyone with a code can check it.
export const verifyCertificate = (code: string, signal?: AbortSignal): Promise<Certificate> =>
	request<Certificate>(endpoints.certificateVerify(code), { signal });

export const listMyCertificates = (signal?: AbortSignal): Promise<Certificate[]> =>
	request<Certificate[]>(endpoints.myCertificates, { signal });
