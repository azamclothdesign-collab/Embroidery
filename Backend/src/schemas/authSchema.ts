import { z } from "zod";

export const authEmailSchema = z.string().trim().email().max(254);

export const authPasswordSchema = z.string().min(8).max(128);

export const loginBodySchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1).max(128),
});

export const registerBodySchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: authEmailSchema,
    password: authPasswordSchema,
    confirmPassword: z.string().min(1).max(128),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const forgotPasswordRequestSchema = z
  .object({
    email: authEmailSchema,
  })
  .strict();

export const forgotPasswordResetSchema = z
  .object({
    email: authEmailSchema,
    password: authPasswordSchema,
    confirmPassword: z.string().min(1).max(128),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const forgotPasswordBodySchema = z.union([
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
]);

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    nextPassword: authPasswordSchema,
    confirmPassword: z.string().min(1).max(128),
  })
  .strict()
  .refine((value) => value.nextPassword === value.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });
