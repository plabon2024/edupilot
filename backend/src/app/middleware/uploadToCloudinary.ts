/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import AppError from '../errors/AppError';
import status from 'http-status';
import { uploadBufferToCloudinary, CloudinaryUploadResult } from '../lib/cloudinary';

// ─── Extend Request ───────────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      cloudinaryUpload?: CloudinaryUploadResult;
    }
  }
}

// ─── Multer: keep file in memory (no disk writes) ────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ALLOWED_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        status.BAD_REQUEST,
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, WEBP.`,
      ),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB hard limit (Cloudinary free tier limit)
});

// ─── Single-file multer middleware ────────────────────────────────────────────
export const multerSingle = upload.single('file');

// ─── Cloudinary upload middleware ─────────────────────────────────────────────
/**
 * Runs after multerSingle. Streams req.file.buffer to Cloudinary and attaches
 * the result to req.cloudinaryUpload so the controller can read it.
 */
export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new AppError(
        status.BAD_REQUEST,
        'No file provided. Use multipart/form-data with a "file" field.',
      );
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'documents',
      resource_type: 'auto',
    });

    req.cloudinaryUpload = result;
    next();
  } catch (error: any) {
    next(error);
  }
};
