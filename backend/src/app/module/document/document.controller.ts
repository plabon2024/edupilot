import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { DocumentService } from './document.service';
import { extractTextFromPDF } from '../../utils/pdfParser';
import { chunkText } from '../../utils/textChunker';

// POST /api/v1/documents/upload
// Body: multipart/form-data with field "file" (binary) and optional field "title" (text)
const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    // multerSingle + uploadToCloudinary middleware ran before this
    const cloudinary = req.cloudinaryUpload;
    if (!cloudinary) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, 'Cloudinary upload result missing.');
    }

    if (!req.file?.buffer) {
      throw new AppError(status.BAD_REQUEST, 'File buffer is missing.');
    }

    // 1. Extract text and create chunks synchronously
    const { text: extractedText } = await extractTextFromPDF(req.file.buffer);
    const chunks = chunkText(extractedText, 500, 50);

    const title: string = (req.body?.title as string) || req.file?.originalname || cloudinary.original_filename;

    const document = await DocumentService.createDocumentRecord({
      userId,
      title,
      fileName:            req.file!.originalname,
      fileSize:            req.file!.size,
      cloudinaryPublicId:  cloudinary.public_id,
      filePath:            cloudinary.secure_url,
      extractedText,
      chunks,
    });

    res.status(status.CREATED).json({
      success: true,
      message: 'Document uploaded and parsed successfully.',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/documents
const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const documents = await DocumentService.getDocuments(userId);

    res.status(status.OK).json({
      success: true,
      message: 'Documents retrieved successfully.',
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/documents/:id
const getDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const document = await DocumentService.getDocument(req.params.id as string, userId);

    res.status(status.OK).json({
      success: true,
      message: 'Document retrieved successfully.',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/documents/:id
const updateDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const document = await DocumentService.updateDocument(req.params.id as string, userId, req.body);

    res.status(status.OK).json({
      success: true,
      message: 'Document updated successfully.',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/documents/:id
const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const result = await DocumentService.deleteDocument(req.params.id as string, userId);

    res.status(status.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const DocumentController = {
  uploadDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
};
