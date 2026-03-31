'use client';

import axiosInstance from '@/lib/axiosInstance';

// ── Types ────────────────────────────────────────────────────

export interface Document {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  flashcardCount: number;
  quizCount: number;
  uploadDate: string;
  lastAccessed?: string;
  extractedText?: string;
}

export interface DocumentUpdatePayload {
  title?: string;
  status?: 'PROCESSING' | 'READY' | 'FAILED';
  extractedText?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Document API ─────────────────────────────────────────────

/**
 * POST /api/v1/documents/upload
 * Sends multipart/form-data with "file" (binary) and optional "title" (text).
 * Auth: required (Bearer token via axiosInstance interceptor)
 */
export async function uploadDocument(file: File, title?: string): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  if (title) {
    formData.append('title', title);
  }

  const response = await axiosInstance.post<ApiResponse<Document>>(
    '/documents/upload',
    formData,
    {
      headers: {
        // Let the browser set Content-Type automatically for multipart/form-data
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

/**
 * GET /api/v1/documents
 * Auth: required
 */
export async function getDocuments(): Promise<Document[]> {
  const response = await axiosInstance.get<ApiResponse<Document[]>>('/documents');
  return response.data.data || [];
}

/**
 * GET /api/v1/documents/:id
 * Auth: required
 */
export async function getDocument(id: string): Promise<Document> {
  const response = await axiosInstance.get<ApiResponse<Document>>(`/documents/${id}`);
  return response.data.data;
}

/**
 * PUT /api/v1/documents/:id
 * Body: raw JSON { "title"?, "status"?, "extractedText"? }
 * Auth: required
 */
export async function updateDocument(id: string, payload: DocumentUpdatePayload): Promise<Document> {
  const response = await axiosInstance.put<ApiResponse<Document>>(`/documents/${id}`, payload);
  return response.data.data;
}

/**
 * DELETE /api/v1/documents/:id
 * Auth: required
 */
export async function deleteDocument(id: string): Promise<{ message: string }> {
  const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(`/documents/${id}`);
  return { message: response.data.message };
}
