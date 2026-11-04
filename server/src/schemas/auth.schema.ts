import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password cannot exceed 128 characters"),
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty")
    .max(50, "Name cannot exceed 50 characters"),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty")
    .max(128, "Password cannot exceed 128 characters"),
});

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .max(100, "Email cannot exceed 100 characters")
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.email !== undefined,
    { message: "At least one field must be provided for update" }
  );

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password cannot be empty")
    .max(128, "Current password cannot exceed 128 characters"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "New password must be at least 6 characters")
    .max(128, "New password cannot exceed 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
