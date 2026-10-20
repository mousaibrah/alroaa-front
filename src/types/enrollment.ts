// Mirrors testback/src/enrollments and testback/src/payments.
export interface Enrollment {
	id: number;
	courseId: number;
	status: 'active' | 'completed' | 'cancelled' | 'expired';
	enrolledAt: string;
	completedAt: string | null;
	price: number;
	currency: string;
	// True once the paid lessons are unlocked (always true for free courses).
	paid: boolean;
	paymentRequired: boolean;
}

export interface MyEnrollment extends Enrollment {
	courseTitle: string;
	courseSlug: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
	id: number;
	courseId: number;
	amount: number;
	currency: string;
	status: PaymentStatus;
	provider: string;
	paidAt: string | null;
	// Where to send the learner to pay; null once the payment is settled.
	checkoutUrl: string | null;
}
