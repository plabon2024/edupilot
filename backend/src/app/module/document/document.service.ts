import status from 'http-status';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/prisma/client';
import { deleteFromCloudinary } from '../../lib/cloudinary';
import AppError from '../../errors/AppError';
import { ICreateDocumentPayload, IUpdateDocumentPayload } from './document.interface';

// ─── Create ──────────────────────────────────────────────────────────
const createDocumentRecord = async (
  payload: Pick<ICreateDocumentPayload, 'userId' | 'title' | 'fileName' | 'cloudinaryPublicId' | 'filePath' | 'fileSize' | 'extractedText' | 'chunks'>
) => {
  const document = await prisma.document.create({
    data: {
      userId: payload.userId,
      title: payload.title || payload.fileName,
      fileName: payload.fileName,
      cloudinaryPublicId: payload.cloudinaryPublicId,
      filePath: payload.filePath,
      fileSize: payload.fileSize,
      extractedText: payload.extractedText || '',
      chunks: (payload.chunks || []) as unknown as Prisma.InputJsonValue,
      status: 'READY',
    },
  });

  return document;
};

// ─── Get All Documents for User ───────────────────────────────────────────────
const getDocuments = async (userId: string) => {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { uploadDate: 'desc' },
    select: {
      id: true,
      title: true,
      fileName: true,
      filePath: true,
      fileSize: true,
      status: true,
      uploadDate: true,
      lastAccessed: true,
      createdAt: true,
    },
  });
};

// ─── Get Single Document ──────────────────────────────────────────────────────
const getDocument = async (documentId: string, userId: string) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!document) {
    throw new AppError(status.NOT_FOUND, 'Document not found.');
  }

  // Update lastAccessed
  await prisma.document.update({
    where: { id: documentId },
    data: { lastAccessed: new Date() },
  });

  return document;
};

// ─── Update Document Metadata ─────────────────────────────────────────────────
const updateDocument = async (
  documentId: string,
  userId: string,
  payload: IUpdateDocumentPayload,
) => {
  const existing = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, 'Document not found.');
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.extractedText !== undefined && { extractedText: payload.extractedText }),
      ...(payload.chunks !== undefined && { chunks: payload.chunks as unknown as Prisma.InputJsonValue }),
      ...(payload.status && { status: payload.status }),
      ...(payload.lastAccessed && { lastAccessed: payload.lastAccessed }),
    },
  });
};

// ─── Delete Document ──────────────────────────────────────────────────────────
const deleteDocument = async (documentId: string, userId: string) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });

  if (!document) {
    throw new AppError(status.NOT_FOUND, 'Document not found.');
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(document.cloudinaryPublicId, 'raw');

  await prisma.document.delete({ where: { id: documentId } });

  return { message: 'Document deleted successfully.' };
};

export const DocumentService = {
  createDocumentRecord,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
};
