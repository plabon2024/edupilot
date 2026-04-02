'use client';

import axiosInstance from '@/lib/axiosInstance';

// ── Types ─────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface Quiz {
  id: string;
  title: string;
  totalQuestions: number;
  score: number;
  completedAt: string | null;
  createdAt: string;
  documentId: string;
  document?: { title?: string; fileName: string };
  questions?: QuizQuestion[];
}

export interface SubmitAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

export interface QuizSubmitResult {
  quizId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
}

export interface QuizResultDetail {
  questionIndex: number;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResults {
  quiz: {
    id: string;
    title: string;
    document: { title?: string } | null;
    score: number;
    totalQuestions: number;
    completedAt: string | null;
  };
  results: QuizResultDetail[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ── Quiz API ──────────────────────────────────────────────────

/**
 * GET /api/v1/quizzes/document/:documentId
 * Lists all quizzes for a specific document.
 */
export async function getQuizzesByDocument(documentId: string): Promise<Quiz[]> {
  const response = await axiosInstance.get<ApiResponse<Quiz[]>>(
    `/quizzes/document/${documentId}`
  );
  return response.data.data || [];
}

/**
 * GET /api/v1/quizzes/:id
 * Returns a single quiz with questions.
 */
export async function getQuizById(quizId: string): Promise<Quiz> {
  const response = await axiosInstance.get<ApiResponse<Quiz>>(`/quizzes/${quizId}`);
  return response.data.data;
}

/**
 * POST /api/v1/quizzes/:id/submit
 * Submits answers for a quiz.
 */
export async function submitQuiz(
  quizId: string,
  answers: SubmitAnswer[]
): Promise<QuizSubmitResult> {
  const response = await axiosInstance.post<ApiResponse<QuizSubmitResult>>(
    `/quizzes/${quizId}/submit`,
    { answers }
  );
  return response.data.data;
}

/**
 * GET /api/v1/quizzes/:id/results
 * Returns detailed results for a completed quiz.
 */
export async function getQuizResults(quizId: string): Promise<QuizResults> {
  const response = await axiosInstance.get<ApiResponse<QuizResults>>(
    `/quizzes/${quizId}/results`
  );
  return response.data.data;
}

/**
 * DELETE /api/v1/quizzes/:id
 * Deletes a quiz.
 */
export async function deleteQuiz(quizId: string): Promise<{ message: string }> {
  const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
    `/quizzes/${quizId}`
  );
  return response.data.data;
}
