'use client';

import axiosInstance from '@/lib/axiosInstance';

// ── Types ─────────────────────────────────────────────────────

export interface FlashcardCard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  reviewCount: number;
  isStarred: boolean;
  lastReviewed?: string | null;
}

export interface FlashcardSet {
  id: string;
  documentId: string | null;
  document?: { title?: string; fileName: string } | null;
  cards: FlashcardCard[];
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ── Flashcard API ─────────────────────────────────────────────

/**
 * GET /api/v1/flashcards
 * Lists all flashcard sets for the current user.
 */
export async function getAllFlashcardSets(): Promise<FlashcardSet[]> {
  const response = await axiosInstance.get<ApiResponse<FlashcardSet[]>>('/flashcards');
  return response.data.data || [];
}

/**
 * GET /api/v1/flashcards/document/:documentId
 * Lists flashcard sets for a specific document.
 */
export async function getFlashcardsByDocument(documentId: string): Promise<FlashcardSet[]> {
  const response = await axiosInstance.get<ApiResponse<FlashcardSet[]>>(
    `/flashcards/document/${documentId}`
  );
  return response.data.data || [];
}

/**
 * POST /api/v1/flashcards/cards/:cardId/review
 * Marks a flashcard as reviewed.
 */
export async function reviewFlashcard(cardId: string): Promise<FlashcardCard> {
  const response = await axiosInstance.post<ApiResponse<FlashcardCard>>(
    `/flashcards/cards/${cardId}/review`,
    {}
  );
  return response.data.data;
}

/**
 * PUT /api/v1/flashcards/cards/:cardId/star
 * Toggles the star on a flashcard.
 */
export async function toggleStarFlashcard(cardId: string): Promise<FlashcardCard> {
  const response = await axiosInstance.put<ApiResponse<FlashcardCard>>(
    `/flashcards/cards/${cardId}/star`,
    {}
  );
  return response.data.data;
}

/**
 * DELETE /api/v1/flashcards/:id
 * Deletes a flashcard set.
 */
export async function deleteFlashcardSet(setId: string): Promise<void> {
  await axiosInstance.delete(`/flashcards/${setId}`);
}
