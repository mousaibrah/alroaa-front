import { z } from "zod";

// What the backend accepts for the profile picture (MAX_IMAGE_SIZE_MB, default 10).
export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const MAX_IMAGE_MB = 10;

const today = () => new Date().toISOString().slice(0, 10);

// Error messages are translation keys; the form renders them with t().
// Limits match the backend RegisterDto.
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "validation.firstNameRequired")
      .max(100, "validation.tooLong"),
    lastName: z
      .string()
      .trim()
      .min(1, "validation.lastNameRequired")
      .max(100, "validation.tooLong"),
    email: z.email("validation.emailInvalid").max(255, "validation.tooLong"),
    password: z
      .string()
      .min(8, "validation.passwordMin")
      .max(72, "validation.passwordMax"),
    confirmPassword: z.string(),
    // Optional fields: 'none' / '' / null are left out of the request.
    gender: z.enum(["0", "1"]),
    // <input type="date"> gives YYYY-MM-DD, as the backend wants.
    dob: z
      .string()
      .refine(
        (v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && v >= "1900-01-01"),
        "validation.dobInvalid",
      )
      .refine((v) => v === "" || v <= today(), "validation.dobFuture"),
    image: z
      .instanceof(File)
      .nullable()
      .refine((f) => !f || IMAGE_TYPES.includes(f.type), "validation.imageType")
      .refine(
        (f) => !f || f.size <= MAX_IMAGE_MB * 1024 * 1024,
        "validation.imageSize",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation.passwordsMismatch",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
