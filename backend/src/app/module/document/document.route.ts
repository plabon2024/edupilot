import { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { multerSingle, uploadToCloudinary } from '../../middleware/uploadToCloudinary';
import { validateRequest } from '../../middleware/validateRequest';
import { DocumentController } from './document.controller';
import { DocumentValidation } from './document.validation';

const router = Router();

// All document routes require authentication
router.use(checkAuth(Role.ADMIN, Role.USER));

// ─── 1. POST /api/v1/documents/upload ────────────────────────────────────────
// Postman: multipart/form-data | field "file" (File) | optional "title" (Text)
router.post(
  '/upload',
  multerSingle,                                                    // parse multipart
  validateRequest(DocumentValidation.uploadDocumentSchema),        // validate text fields
  uploadToCloudinary,                                              // stream to Cloudinary
  DocumentController.uploadDocument,                               // save DB record
);

// ─── 2. GET /api/v1/documents ─────────────────────────────────────────────────
router.get('/', DocumentController.getDocuments);

// ─── 3. GET /api/v1/documents/:id ────────────────────────────────────────────
router.get('/:id', DocumentController.getDocument);

// ─── 4. PUT /api/v1/documents/:id ────────────────────────────────────────────
// Postman: raw JSON body — { "title"?, "status"?, "extractedText"? }
router.put(
  '/:id',
  validateRequest(DocumentValidation.updateDocumentSchema),
  DocumentController.updateDocument,
);

// ─── 5. DELETE /api/v1/documents/:id ─────────────────────────────────────────
router.delete('/:id', DocumentController.deleteDocument);

export const DocumentRoutes = router;
