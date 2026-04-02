'use client';

import axiosInstance from '@/lib/axiosInstance';

// ── Types ─────────────────────────────────────────────────────

export interface ProgressDashboard {
  overview: {
    totalDocuments: number;
    totalFlashcardSets: number;
    totalFlashcards: number;
    reviewedFlashcards: number;
    starredFlashcards: number;
    totalQuizzes: number;
    completedQuizzes: number;
    averageScore: number;
  };
  recentActivity: {
    documents: Array<{
      title: string;
      fileName: string;
      lastAccessed: string | null;
    }>;
    quizzes: Array<{
      title: string;
      score: number;
      totalQuestions: number;
      completedAt: string | null;
      document: { title: string } | null;
    }>;
  };
}

export interface DocumentProgress {
  document: { id: string; title: string; fileName: string };
  flashcards: {
    sets: number;
    totalCards: number;
    reviewedCards: number;
  };
  quizzes: {
    total: number;
    completed: number;
    list: Array<{
      id: string;
      title: string;
      score: number;
      totalQuestions: number;
      completedAt: string | null;
    }>;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ── Progress API ──────────────────────────────────────────────

/**
 * GET /api/v1/progress/dashboard
 * Returns overall dashboard stats for the logged-in user.
 */
export async function getDashboardProgress(): Promise<ProgressDashboard> {
  const response = await axiosInstance.get<ApiResponse<ProgressDashboard>>('/progress/dashboard');
  return response.data.data;
}

/**
 * GET /api/v1/progress/document/:documentId
 * Returns progress for a specific document.
 */
export async function getDocumentProgress(documentId: string): Promise<DocumentProgress> {
  const response = await axiosInstance.get<ApiResponse<DocumentProgress>>(
    `/progress/document/${documentId}`
  );
  return response.data.data;
}
