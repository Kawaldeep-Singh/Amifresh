import { z } from 'zod';

export const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
  referralCode: z.string().toUpperCase().trim().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const approveRegistrationSchema = z.object({
  registrationId: z.string(),
});

export const rejectRegistrationSchema = z.object({
  registrationId: z.string(),
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters long').trim(),
});

export const referralCodeSchema = z.string().toUpperCase().trim().optional();
