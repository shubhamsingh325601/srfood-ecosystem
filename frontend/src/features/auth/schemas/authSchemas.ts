import { z } from "zod";

const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const passwordRulesSchema = z.string().min(1, "Password is required");

export const loginSchema = z.object({
  mobile: mobileSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  mobile: mobileSchema,
  password: passwordRulesSchema,
});
export type SignupFormValues = z.infer<typeof signupSchema>;
