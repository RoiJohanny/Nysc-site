import { z } from 'zod';
import { sanitizePlainText } from './sanitize';

/**
 * Zod validation schema for user feedback & bug reporting
 * Enforces length constraints, prevents empty strings, and rejects dangerous script tags.
 */
export const feedbackFormSchema = z.object({
  category: z.enum(['bug', 'feature_request', 'general']),
  message: z
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters long')
    .max(1200, 'Message cannot exceed 1200 characters')
    .transform(val => sanitizePlainText(val))
    .refine(val => val.length >= 5, 'Message contains only invalid or stripped characters')
});

/**
 * Zod validation schema for corps member profile
 */
export const profileFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name must have at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters')
    .transform(val => sanitizePlainText(val)),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+() -]{7,20}$/, 'Invalid phone number format')
    .transform(val => sanitizePlainText(val)),
  state_code: z
    .string()
    .trim()
    .max(20, 'State code cannot exceed 20 characters')
    .transform(val => sanitizePlainText(val)),
  state_of_deployment: z
    .string()
    .trim()
    .min(2, 'State of deployment is required')
    .transform(val => sanitizePlainText(val)),
  lga: z
    .string()
    .trim()
    .min(2, 'Local Government Area is required')
    .transform(val => sanitizePlainText(val)),
  ppa_name: z
    .string()
    .trim()
    .min(2, 'PPA name is required')
    .max(120, 'PPA name cannot exceed 120 characters')
    .transform(val => sanitizePlainText(val)),
  cds_group: z
    .string()
    .trim()
    .min(2, 'CDS group is required')
    .transform(val => sanitizePlainText(val))
});

/**
 * Maximum allowed file size for document vault and image uploads: 5MB (5242880 bytes)
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const documentUploadSchema = z.object({
  document_type: z.enum([
    'Call Up Letter',
    'Green Card',
    'PPA Letter',
    'NYSC ID',
    'Camp Discharge Slip',
    'Medical Fitness',
    'Other'
  ]),
  file_name: z
    .string()
    .trim()
    .min(1, 'File name is required')
    .max(120, 'File name cannot exceed 120 characters')
    .transform(val => sanitizePlainText(val)),
  file_url: z
    .string()
    .trim()
    .min(1, 'File content or URL is required'),
  file_size_bytes: z
    .number()
    .max(MAX_FILE_SIZE_BYTES, 'File size cannot exceed 5MB')
    .optional()
});

/**
 * Zod validation schema for emergency contacts
 */
export const emergencyContactSchema = z.object({
  contact_name: z
    .string()
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(80, 'Contact name cannot exceed 80 characters')
    .transform(val => sanitizePlainText(val)),
  role_title: z
    .string()
    .trim()
    .min(2, 'Role or office title is required')
    .max(80, 'Role title cannot exceed 80 characters')
    .transform(val => sanitizePlainText(val)),
  phone_number: z
    .string()
    .trim()
    .regex(/^[0-9+() -]{7,20}$/, 'Invalid phone number format')
    .transform(val => sanitizePlainText(val)),
  notes: z
    .string()
    .trim()
    .max(300, 'Notes cannot exceed 300 characters')
    .transform(val => sanitizePlainText(val))
    .optional()
});

/**
 * Zod validation schema for expense tracking
 */
export const expenseFormSchema = z.object({
  category: z.string().trim().min(1, 'Category is required'),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(10000000, 'Amount exceeds realistic service allowance limits'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(200, 'Description cannot exceed 200 characters')
    .transform(val => sanitizePlainText(val)),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

/**
 * Zod validation schema for marketplace listings
 */
export const marketplaceItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Item title must be at least 3 characters')
    .max(100, 'Item title cannot exceed 100 characters')
    .transform(val => sanitizePlainText(val)),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(5000000, 'Price exceeds maximum threshold'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(800, 'Description cannot exceed 800 characters')
    .transform(val => sanitizePlainText(val)),
  category: z.string().trim().min(1, 'Category is required')
});
