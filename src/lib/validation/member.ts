import { z } from "zod";

export const phoneSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile (e.g. +919876543210)"),
});

export const otpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  otp:   z.string().length(6).regex(/^\d{6}$/, "6-digit code"),
});

export const personalSchema = z.object({
  full_name:     z.string().trim().min(2).max(120),
  father_name:   z.string().trim().min(2).max(120),
  date_of_birth: z.coerce.date().refine(d => d < new Date(), "DOB must be in the past"),
  gender:        z.enum(["M","F","O"]),
  email:         z.union([z.string().email().max(255), z.literal("")]).optional(),
});

export const educationSchema = z.object({
  education_level: z.enum(["none","primary","secondary","higher_secondary","diploma","graduate","postgraduate","doctorate"]),
  qualification:   z.string().trim().max(120).optional().or(z.literal("")),
  institution:     z.string().trim().max(160).optional().or(z.literal("")),
  year_completed:  z.coerce.number().int().min(1950).max(new Date().getFullYear()).optional(),
});

export const occupationSchema = z.object({
  occupation:    z.string().trim().min(2).max(120),
  employer:      z.string().trim().max(160).optional().or(z.literal("")),
  annual_income: z.coerce.number().min(0).max(1e10).optional(),
});

export const addressSchema = z.object({
  address_line1: z.string().trim().min(3).max(200),
  address_line2: z.string().trim().max(200).optional().or(z.literal("")),
  pincode:       z.string().regex(/^\d{6}$/, "6-digit pincode"),
  state_id:      z.coerce.number().int().positive(),
  pc_id:         z.coerce.number().int().positive(),
  ac_id:         z.coerce.number().int().positive(),
  mandal_id:     z.coerce.number().int().positive(),
  village_id:    z.coerce.number().int().positive(),
});

export const photoSchema = z.object({ photo_url: z.string().url() });

export type StepName = "photo" | "personal" | "education" | "occupation" | "address";
export const STEP_SCHEMAS = {
  photo: photoSchema,
  personal: personalSchema,
  education: educationSchema,
  occupation: occupationSchema,
  address: addressSchema,
} as const;
export const STEP_ORDER: StepName[] = ["photo","personal","education","occupation","address"];
