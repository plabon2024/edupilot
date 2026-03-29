import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import status from 'http-status';

/* ── Get full dashboard stats for a user ─────────────────────── */
const getDashboard = async (userId: string) => {
  const [
    totalDocuments,
    totalFlashcardSets,
    totalQuizzes,
    completedQuizzes,
    flashcardCards,
    completedQuizzesData,
    recentDocuments,
    recentQuizzes,
  ] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.flashcard.count({ where: { userId } }),
    prisma.quiz.count({ where: { userId } }),
    prisma.quiz.count({ where: { userId, completedAt: { not: null } } }),
    prisma.flashcardCard.findMany({
      where: { flashcard: { userId } },
      select: { reviewCount: true, isStarred: true },
    }),
    prisma.quiz.findMany({
      where: { userId, completedAt: { not: null } },
      select: { score: true },
    }),
    prisma.document.findMany({
      where: { userId },
      select: { title: true, fileName: true, lastAccessed: true },
      orderBy: { lastAccessed: 'desc' },
      take: 5,
    }),
    prisma.quiz.findMany({
      where: { userId },
      select: {
        title: true,
        score: true,
        totalQuestions: true,
        completedAt: true,
        document: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalFlashcards = flashcardCards.length;
  const reviewedFlashcards = flashcardCards.filter(
    (c: { reviewCount: number; isStarred: boolean }) => c.reviewCount > 0,
  ).length;
  const starredFlashcards = flashcardCards.filter(
    (c: { reviewCount: number; isStarred: boolean }) => c.isStarred,
  ).length;
  const averageScore =
    completedQuizzesData.length > 0
      ? Math.round(
          completedQuizzesData.reduce(
            (sum: number, q: { score: number }) => sum + q.score,
            0,
          ) / completedQuizzesData.length,
        )
      : 0;

  return {
    overview: {
      totalDocuments,
      totalFlashcardSets,
      totalFlashcards,
      reviewedFlashcards,
      starredFlashcards,
      totalQuizzes,
      completedQuizzes,
      averageScore,
    },
    recentActivity: {
      documents: recentDocuments,
      quizzes: recentQuizzes,
    },
  };
};

// NOTE: Quiz completion is handled by QuizService.submitQuiz (with full answer evaluation).
// Do not expose a separate completeQuiz method here — it would bypass answer scoring.

/* ── Get per-document progress summary ───────────────────────── */
const getDocumentProgress = async (userId: string, documentId: string) => {
  const doc = await prisma.document.findFirst({ where: { id: documentId, userId } });
  if (!doc) throw new AppError(status.NOT_FOUND, 'Document not found');

  const [flashcardSets, quizzes] = await Promise.all([
    prisma.flashcard.findMany({
      where: { documentId, userId },
      include: { cards: { select: { reviewCount: true, isStarred: true } } },
    }),
    prisma.quiz.findMany({
      where: { documentId, userId },
      select: { id: true, title: true, score: true, totalQuestions: true, completedAt: true },
    }),
  ]);

  type CardMini = { reviewCount: number; isStarred: boolean };
  type SetMini = { cards: CardMini[] };
  const totalCards = flashcardSets.reduce((n: number, s: SetMini) => n + s.cards.length, 0);
  const reviewedCards = flashcardSets.reduce(
    (n: number, s: SetMini) => n + s.cards.filter((c: CardMini) => c.reviewCount > 0).length,
    0,
  );

  type QuizMini = { id: string; title: string; score: number; totalQuestions: number; completedAt: Date | null };
  return {
    document: { id: doc.id, title: doc.title, fileName: doc.fileName },
    flashcards: { sets: flashcardSets.length, totalCards, reviewedCards },
    quizzes: {
      total: quizzes.length,
      completed: (quizzes as QuizMini[]).filter((q) => q.completedAt !== null).length,
      list: quizzes,
    },
  };
};

export const ProgressService = {
  getDashboard,
  getDocumentProgress,
};
