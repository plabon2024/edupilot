import { z } from 'zod';

// ─── Upload (POST /documents/upload) ─────────────────────────────────────────
// Body is multipart/form-data; only the optional text fields need validation.
// The file itself is validated by multer's fileFilter.
const uploadDocumentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be at most 255 characters')
    .optional(),
});

// ─── Update (PUT /documents/:id) ─────────────────────────────────────────────
// Body is raw JSON.
const updateDocumentSchema = z.object({
  title: z
    .string({ error: 'Title must be a string' })
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be at most 255 characters')
    .optional(),

  status: z
    .enum(['PROCESSING', 'READY', 'FAILED'], {
      error: 'status must be one of: PROCESSING, READY, FAILED',
    })
    .optional(),

  extractedText: z
    .string({ error: 'extractedText must be a string' })
    .optional(),
});

export const DocumentValidation = {
  uploadDocumentSchema,
  updateDocumentSchema,
};
