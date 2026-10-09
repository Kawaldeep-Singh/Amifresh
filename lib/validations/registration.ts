import { z } from 'zod';

export const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number').trim(),
  referralCode: z.string().toUpperCase().trim().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  fatherSpouseName: z.string().optional(),
  photo: z.string().optional(),
  panCard: z.string().optional(),
  aadhaarCard: z.string().optional(),
});

export const approveRegistrationSchema = z.object({
  registrationId: z.string(),
});

export const rejectRegistrationSchema = z.object({
  registrationId: z.string(),
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters long').trim(),
});

export const referralCodeSchema = z.string().toUpperCase().trim().optional();
