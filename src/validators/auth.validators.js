import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    businessName: z.string().min(2),
    ownerName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
    password: z.string().min(8),
    industry: z.string().min(2),
    country: z.string().min(2),
    city: z.string().min(2)
  })
});

export const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(8) })
});

export const forgotPasswordSchema = z.object({ body: z.object({ email: z.string().email() }) });

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().min(20), password: z.string().min(8) })
});
