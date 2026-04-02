'use client';

import axiosInstance from '@/lib/axiosInstance';

// ── Types ────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface FlashcardSet {
  id: string;
  documentId: string;
  title?: string;
  cards: { front: string; back: string }[];
  createdAt?: string;
}

export interface Quiz {
  id: string;
  documentId: string;
  title?: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── AI API ──────────────────────────────────────────────────

/**
 * POST /api/v1/ai/generate-flashcards
 * Consumes AI credits (usageLimiter). Auth: required.
 * @param documentId - ID of the document to generate flashcards from
 * @param count - Number of flashcards to generate (default 10)
 */
export async function generateFlashcards(documentId: string, count = 10): Promise<FlashcardSet> {
  const response = await axiosInstance.post<ApiResponse<FlashcardSet>>(
    '/ai/generate-flashcards',
    { documentId, count }
  );
  return response.data.data;
}

/**
 * POST /api/v1/ai/generate-quiz
 * Consumes AI credits (usageLimiter). Auth: required.
 * @param documentId - ID of the document to generate a quiz from
 * @param numQuestions - Number of quiz questions (default 5)
 * @param title - Optional title for the quiz
 */
export async function generateQuiz(
  documentId: string,
  numQuestions = 5,
  title?: string
): Promise<Quiz> {
  const response = await axiosInstance.post<ApiResponse<Quiz>>(
    '/ai/generate-quiz',
    { documentId, numQuestions, ...(title ? { title } : {}) }
  );
  return response.data.data;
}

/**
 * POST /api/v1/ai/generate-summary
 * Consumes AI credits (usageLimiter). Auth: required.
 * @param documentId - ID of the document to summarize
 */
export async function generateSummary(documentId: string): Promise<{ summary: string }> {
  const response = await axiosInstance.post<ApiResponse<{ summary: string }>>(
    '/ai/generate-summary',
    { documentId }
  );
  return response.data.data;
}

/**
 * POST /api/v1/ai/chat
 * Consumes AI credits (usageLimiter). Auth: required.
 * @param documentId - ID of the document context
 * @param question - The user's question
 */
export async function chatWithDocument(
  documentId: string,
  question: string
): Promise<{ answer: string }> {
  const response = await axiosInstance.post<ApiResponse<{ answer: string }>>(
    '/ai/chat',
    { documentId, question }
  );
  return response.data.data;
}

/**
 * POST /api/v1/ai/explain-concept
 * Consumes AI credits (usageLimiter). Auth: required.
 * @param documentId - ID of the document context
 * @param concept - The concept to explain
 */
export async function explainConcept(
  documentId: string,
  concept: string
): Promise<{ explanation: string }> {
  const response = await axiosInstance.post<ApiResponse<{ explanation: string }>>(
    '/ai/explain-concept',
    { documentId, concept }
  );
  return response.data.data;
}

/**
 * GET /api/v1/ai/chat-history/:documentId
 * Does NOT consume AI credits. Auth: required.
 * @param documentId - ID of the document to retrieve chat history for
 */
export async function getChatHistory(documentId: string): Promise<ChatMessage[]> {
  const response = await axiosInstance.get<ApiResponse<ChatMessage[]>>(
    `/ai/chat-history/${documentId}`
  );
  return response.data.data || [];
}
